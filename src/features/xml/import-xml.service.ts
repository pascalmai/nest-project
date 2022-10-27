import { promises as fsp, readFileSync } from 'fs';
import xml2js from 'xml2js';
import get from 'lodash/get';
import find from 'lodash/find';
import filter from 'lodash/filter';
import { Injectable, Logger } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { ArticleEntity } from '../article/entities/article.entity';
import { ArticleSizeEntity } from '../article/entities/article-size.entity';
import { ImportedOrderEntity } from '../imported-order/entities/imported-order.entity';
import { ImportedOrderLineEntity } from '../imported-order/entities/imported-order-line.entity';
import {
  SHIP_TO_ADDRESS_1_TAG,
  SHIP_TO_ADDRESS_2_TAG,
  COLOR_ATTR_KEY,
  CUSTOMER_NUMBER,
  EAN_TAG,
  FONT_ATTR_KEY,
  IMAGE_TYPE,
  ITEM_NUM_TAG,
  ITEM_VARIANT_TAG,
  LINE_TAG,
  LINES_TAG,
  ORDER_NUMBER,
  ORDER_TAG,
  ORDERS_TAG,
  POSITION_TAG,
  POSITIONS_TAG,
  POSTCODE_TAG,
  QUANTITY_TAG,
  TEXT_TYPE,
  TYPE_ATTR_KEY,
  VIEW_ATTR_KEY,
  XML_ATTR_KEY,
  XML_CHAR_KEY,
  XML_FILE_EXT,
  HOUSE_NUMBER_REGEX,
  CITY_TAG,
  INDIVIDUALISATION_TAG,
  SHIP_TO_NAME_1_TAG,
  SHIP_TO_NAME_2_TAG,
  IO_UNPROCESSED_DIR,
  IO_ERROR_DIR,
  IO_PROCESSED_DIR,
  ORDERLINE_UNIT_PRICE,
  EMAIL_EXPORT_XML_ORDER_ERROR,
  ITEM_DESCRIPTION,
  FIELD_ATTR_KEY,
  CUSTOMER_NAME,
  CUSTOMER_EMAIL,
  TEAM_SHOP_NAME,
} from '../../shared/constants';
import map from 'lodash/map';
import { SportclubEntity } from '../sportclub/entities/sportclub.entity';
import { AddressEntity } from '../address/address.entity';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { ImportedOrderLinePrintTemplateEntity } from '../imported-order/entities/imported-order-line-print-template.entity';
import { isEmpty } from 'lodash';
import { EmailService } from '../email/email.service';
import { SportclubContactEntity } from '../sportclub/entities/sportclub-contact.entity';
import { sleep } from 'src/shared/utils';
import { ImportOrderResponse } from 'src/shared/interfaces';

@Injectable()
export class ImportXmlService {
  private articleRepository: Repository<ArticleEntity>;
  private articleSizeRepository: Repository<ArticleSizeEntity>;
  private importedOrderRepository: Repository<ImportedOrderEntity>;
  private importedOrderLineRepository: Repository<ImportedOrderLineEntity>;
  private sportclubRepository: Repository<SportclubEntity>;
  private addressRepository: Repository<AddressEntity>;
  private importedOrderLinePrintTemplateRepository: Repository<ImportedOrderLinePrintTemplateEntity>;
  private sportclubContactRepository: Repository<SportclubContactEntity>;

  private readonly logger = new Logger(ImportXmlService.name);

  private importStat: ImportOrderResponse = {
    successes: [],
    errors: [],
  };
  private errorEmailsQueue: Array<any> = [];

  /**
   * explicitly get repositories from TypeORM connection, so we don't need
   * to inject modules and can avoid circular dependencies in future
   */
  constructor(
    private readonly emailService: EmailService,
    private connection: Connection,
  ) {
    this.articleRepository = this.connection.getRepository(ArticleEntity);
    this.articleSizeRepository =
      this.connection.getRepository(ArticleSizeEntity);
    this.importedOrderRepository =
      this.connection.getRepository(ImportedOrderEntity);
    this.importedOrderLineRepository = this.connection.getRepository(
      ImportedOrderLineEntity,
    );
    this.sportclubRepository = this.connection.getRepository(SportclubEntity);
    this.addressRepository = this.connection.getRepository(AddressEntity);
    this.importedOrderLinePrintTemplateRepository =
      this.connection.getRepository(ImportedOrderLinePrintTemplateEntity);
    this.sportclubContactRepository = this.connection.getRepository(
      SportclubContactEntity,
    );
  }

  async processFiles() {
    this.importStat = {
      errors: [],
      successes: [],
    };
    let fileNames = await fsp.readdir(IO_UNPROCESSED_DIR, {
      encoding: 'utf-8',
    });
    fileNames = fileNames.filter((filename) => filename.charAt(0) !== '.');

    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      if (ImportXmlService.isXml(fileName)) {
        await this.createOrderFromXml(fileName);
      }
    }

    // this.sendErrorEmails();

    return this.importStat;
  }

  private async createOrderFromXml(fileName: string): Promise<void> {
    try {
      const data = await ImportXmlService.parseUnprocessedXml(fileName);

      const order = get(data, `${ORDERS_TAG}.${ORDER_TAG}[0]`);
      const orderNumber = get(order, `${ORDER_NUMBER}[0]`);

      const existed = await this.importedOrderRepository.findOne({
        orderNumber,
      });

      if (existed) throw new Error('Order already exist');

      const jakoCustomerNumber = get(order, `${CUSTOMER_NUMBER}[0]`);
      const teamShopName = get(order, `${TEAM_SHOP_NAME}[0]`);
      const customerName = get(order, `${CUSTOMER_NAME}[0]`);
      const customerEmail = get(order, `${CUSTOMER_EMAIL}[0]`);

      const shipToName1 = get(order, `${SHIP_TO_NAME_1_TAG}[0]`);
      const shipToName2 = get(order, `${SHIP_TO_NAME_2_TAG}[0]`);

      const shipToAddress1 = get(order, `${SHIP_TO_ADDRESS_1_TAG}[0]`);
      const shipToAddress2 = get(order, `${SHIP_TO_ADDRESS_2_TAG}[0]`);

      const street = shipToAddress1.replace(HOUSE_NUMBER_REGEX, '').trim();
      const houseNumber = get(shipToAddress1.match(HOUSE_NUMBER_REGEX), '[0]');
      const postalCode = get(order, `${POSTCODE_TAG}[0]`);
      const city = get(order, `${CITY_TAG}[0]`);

      const positions = get(order, `${POSITIONS_TAG}[0].${POSITION_TAG}`, []);
      const orderLineEntities = [];

      for (const orderPosition of positions) {
        const orderLines = get(
          orderPosition,
          `${INDIVIDUALISATION_TAG}[0].${LINES_TAG}`,
        );
        const jakoId = get(orderPosition, `${ITEM_NUM_TAG}[0]`);

        // itemVariant is basically jakoColorCode + articleSize.jakoSizeId
        const itemVariant = get(orderPosition, `${ITEM_VARIANT_TAG}[0]`);
        const ean = get(orderPosition, `${EAN_TAG}[0]`);
        const itemDescription = get(orderPosition, `${ITEM_DESCRIPTION}[0]`);
        const amount = Number(get(orderPosition, `${QUANTITY_TAG}[0]`, 0));

        let articleSize = await this.findArticleSizeByEAN(ean);
        const jakoColorCode = itemVariant.replace(articleSize.jakoSizeId, '');
        let article = await this.findArticle(jakoId, jakoColorCode);

        if (!articleSize) {
          articleSize = await this.articleSizeRepository.create({
            ean: ean || '0',
            availableFrom: new Date(),
            availableTo: new Date(),
            weightInKg: 0,
            volumneInLiter: 0,
          });

          articleSize = await this.articleSizeRepository.save(articleSize);
        }

        if (!article) {
          article = await this.articleRepository.create({
            jakoId: jakoId || '0',
            name: 'default',
            jakoColorCode: itemVariant || '0',
            jakoColorDescription: 'default',
            articleType: 'default',
          });
          article = await this.articleRepository.save(article);
        }

        const price = Number(
          get(orderPosition, `${ORDERLINE_UNIT_PRICE}[0]`, 0),
        );

        const entities =
          orderLines && orderLines.length
            ? map(orderLines, (orderLine) => {
                const lineItem = get(orderLine, LINE_TAG);
                const imageXmlObject = find(
                  lineItem,
                  (v) =>
                    get(v, `${XML_ATTR_KEY}.${TYPE_ATTR_KEY}`) === IMAGE_TYPE,
                );
                const textXmlObject = find(
                  lineItem,
                  (v) =>
                    get(v, `${XML_ATTR_KEY}.${TYPE_ATTR_KEY}`) === TEXT_TYPE,
                );
                const imageXmlList = filter(
                  lineItem,
                  (v) =>
                    get(v, `${XML_ATTR_KEY}.${TYPE_ATTR_KEY}`) === IMAGE_TYPE,
                );

                const printTemplates = map(imageXmlList, (imageXmlItem) => {
                  return this.importedOrderLinePrintTemplateRepository.create({
                    imageUrl: get(imageXmlItem, `${XML_CHAR_KEY}`, null),
                    imageView: get(
                      imageXmlItem,
                      `${XML_ATTR_KEY}.${VIEW_ATTR_KEY}`,
                      null,
                    ),
                    imageField: get(
                      imageXmlItem,
                      `${XML_ATTR_KEY}.${FIELD_ATTR_KEY}`,
                      null,
                    ),
                  });
                });

                return this.importedOrderLineRepository.create({
                  articleId: article.id,
                  articleSizeId: articleSize.id,
                  importedOrderLinePrintTemplate: printTemplates,
                  amount,
                  price,
                  itemDescription,
                  printText: get(textXmlObject, `${XML_CHAR_KEY}`, null),
                  fontFamily: get(
                    textXmlObject,
                    `${XML_ATTR_KEY}.${FONT_ATTR_KEY}`,
                    null,
                  ),
                  fontColor: get(
                    textXmlObject,
                    `${XML_ATTR_KEY}.${COLOR_ATTR_KEY}`,
                    null,
                  ),
                  textView: get(
                    textXmlObject,
                    `${XML_ATTR_KEY}.${VIEW_ATTR_KEY}`,
                    null,
                  ),
                });
              })
            : [
                this.importedOrderLineRepository.create({
                  articleId: article.id,
                  articleSizeId: articleSize.id,
                  amount,
                  price,
                  printText: null,
                  fontFamily: null,
                  fontColor: null,
                  textView: null,
                }),
              ];
        orderLineEntities.push(...entities);
      }

      const addressEntityData: DeepPartial<AddressEntity> = {
        addressLine2: !isEmpty(shipToAddress2) ? shipToAddress1 : null,
        postalCode,
        street,
        houseNumber,
        city,
        addressLine1: [shipToName1, shipToName2].filter((v) => v).join(', '),
      };

      let sportclub = await this.sportclubRepository.findOne({
        jakoCustomerNumber,
      });

      if (sportclub && !sportclub.teamShopName) {
        sportclub.teamShopName = teamShopName
          ? teamShopName
          : jakoCustomerNumber;
        await this.sportclubRepository.update(
          { jakoCustomerNumber },
          sportclub,
        );
      }

      this.logger.log(`existed sportclub: ${JSON.stringify(sportclub)}`);

      if (!sportclub) {
        const sportclubContact = await this.sportclubContactRepository.findOne({
          email: customerEmail,
        });

        sportclub = await this.sportclubRepository.save({
          name: sportclubContact?.fullName
            ? sportclubContact.fullName
            : customerName
            ? customerName
            : shipToName1,
          teamShopName,
          jakoCustomerNumber,
          invoiceAddress: { ...addressEntityData },
          shippingAddress: { ...addressEntityData },
        });

        this.logger.log(`new sportclub: ${JSON.stringify(sportclub)}`);

        const contact = {
          sportclubId: sportclub.id,
          email: customerEmail,
          fullName: customerName,
        } as SportclubContactEntity;

        const contactEntity = this.sportclubContactRepository.create(contact);
        this.sportclubContactRepository.save(contactEntity);

        this.logger.log(
          `new sportclub contact: ${JSON.stringify(contactEntity)}`,
        );
      }

      const orderEntity = this.importedOrderRepository.create({
        orderNumber,
        sportclub,
        discount: sportclub.discount,
        shippingAddress: { ...addressEntityData },
      });
      orderEntity.orderLines = orderLineEntities;

      await this.importedOrderRepository.save(orderEntity);

      // Rename imported order filename so that it  contains id
      // so  that we can identify it
      const filePath = `${IO_UNPROCESSED_DIR}/${fileName}`;
      const splittedPath = filePath.split('/');
      splittedPath.splice(-1);
      const updatedPath = splittedPath.join('/');
      await fsp.rename(
        filePath,
        `${updatedPath}/order_data_${orderEntity.orderNumber}.xml`,
      );

      await ImportXmlService.moveFile(
        `order_data_${orderEntity.orderNumber}.xml`,
        IO_UNPROCESSED_DIR,
        IO_PROCESSED_DIR,
      );

      this.importStat.successes.push(
        `order_data_${orderEntity.orderNumber}.xml`,
      );
    } catch (e) {
      this.importStat.errors.push(e);
      this.errorEmailsQueue.push({ fileName, message: e.message });
      this.logger.error(e.message);
      await ImportXmlService.moveFile(
        fileName,
        IO_UNPROCESSED_DIR,
        IO_ERROR_DIR,
      );
    }
  }

  private async sendErrorEmails() {
    try {
      let i = 0;
      const queueLength = this.errorEmailsQueue.length;
      while (i < queueLength) {
        const { fileName, message } = this.errorEmailsQueue.pop();
        const file = readFileSync(`${IO_ERROR_DIR}/${fileName}`);
        const emails = process.env.IMPORT_ORDER_ERROR_EMAILS;
        const splittedEmails = emails.split(',');
        this.emailService.sendEmailWithAttachment(
          splittedEmails,
          {
            filename: fileName,
            content: file,
          },
          `${EMAIL_EXPORT_XML_ORDER_ERROR} ${fileName}`,
          message,
        );
        if (i % 7 === 0) await sleep(1000 * 30);
        else await sleep(1000 * 3);

        this.logger.log(`sent error email for: ${fileName}: ${message}`);
        i++;
      }
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  private findArticle(
    jakoId: string,
    jakoColorCode: string,
  ): Promise<ArticleEntity> {
    return this.articleRepository.findOne(
      { jakoId, jakoColorCode },
      { select: ['id', 'jakoId', 'jakoColorCode'] },
    );
  }

  private findArticleSizeByEAN(ean: string): Promise<ArticleSizeEntity> {
    return this.articleSizeRepository.findOne(
      { ean },
      { select: ['id', 'jakoSizeId', 'ean', 'gender'], relations: ['gender'] },
    );
  }

  private static isXml(fileName: string): boolean {
    return fileName.includes(XML_FILE_EXT);
  }

  private static async parseUnprocessedXml(fileName: string): Promise<any> {
    const parser = new xml2js.Parser({ trim: true });
    const fileContent = await fsp.readFile(`${IO_UNPROCESSED_DIR}/${fileName}`);
    return parser.parseStringPromise(fileContent);
  }

  private static async moveFile(
    fileName: string,
    sourceDir: string,
    targetDir: string,
  ) {
    await fsp.copyFile(`${sourceDir}/${fileName}`, `${targetDir}/${fileName}`);
    await fsp.unlink(`${sourceDir}/${fileName}`);
  }
}
