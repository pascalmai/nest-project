import { Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { concatMap, forkJoin, from, map, Observable, tap } from 'rxjs';
import { FindConditions } from 'typeorm';
import { GenerateXmlService } from '../xml/generate-xml.service';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { OrderLineRepository } from './repositories/order-line.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrdersResponse } from '../../shared/interfaces';
import { OkResponseDto, SendEmailDto } from '../../shared/dto';
import { throwNotFoundError } from '../../shared/errors';
import cloneDeep from 'lodash/cloneDeep';
import {
  getPrefixedInvoiceNumber,
  getPrefixedOrderNumber,
  setIfDefined,
} from '../../shared/services';
import { OrderPdfService } from '../pdf/order-pdf.service';
import { EmailService } from '../email/email.service';
import { SportclubRepository } from '../sportclub/repositories/sportclub.repository';
import fs from 'fs';
import { find } from 'lodash';
import { FtpExportService } from '../ftp-export/ftp-export.service';
import {
  FTP_SERVER_BASE_DIR,
  LOCAL_EXPORTED_IO_DIR,
} from 'src/shared/constants';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderLineRepository: OrderLineRepository,
    private readonly generateXmlService: GenerateXmlService,
    private readonly orderPdfService: OrderPdfService,
    private readonly emailService: EmailService,
    private readonly sportclubRepository: SportclubRepository,
    private readonly ftpExportService: FtpExportService,
  ) {}

  findAll(sportclubId: string, teamId?: string): Observable<OrdersResponse[]> {
    return from(this.orderRepository.findOrders({ sportclubId, teamId })).pipe(
      map((entities) => entities.map(OrderService.adjustOrderNumber)),
    );
  }

  lookup(
    collectionId?: string,
  ): Observable<{ orders: OrdersResponse[]; articleIds: string[] }> {
    return forkJoin([
      from(this.orderRepository.findOrders({ collectionId })),
      from(this.orderRepository.findCollectionArticles(collectionId)),
    ]).pipe(map(([orders, articleIds]) => ({ orders, articleIds })));
  }

  findOneWithDetails(id: string): Observable<OrderEntity> {
    const qb = this.orderRepository.createQueryBuilder('order');

    return from(
      qb
        .where({ id })
        .leftJoinAndSelect('order.orderLines', 'orderLines')
        .leftJoinAndSelect('order.collection', 'collection')
        .leftJoinAndSelect('collection.team', 'team')
        .leftJoinAndSelect('team.sportclub', 'sportclub')
        .leftJoinAndSelect('orderLines.article', 'article')
        .leftJoinAndSelect('article.jakoCategories', 'jakoCategories')
        .leftJoinAndSelect('jakoCategories.category', 'category')
        .leftJoinAndSelect('orderLines.articleSize', 'articleSize')
        .leftJoinAndSelect('articleSize.gender', 'gender')
        .leftJoin(
          'article.printTemplates',
          'printTemplate',
          'printTemplate.collection_id = collection.id',
        )
        .select([
          'order.id',
          'order.orderNumber',
          'order.status',
          'order.isDownloaded',
          'order.exportedTimestamp',
          'order.isExported',
          'order.isReadyForExport',
          'order.createdAt',
          'order.discount',
          'collection.id',
          'team.id',
          'sportclub.id',
          'sportclub.jakoCustomerNumber',
          'orderLines.id',
          'orderLines.price',
          'orderLines.amount',
          'orderLines.printNumber',
          'orderLines.printText',
          'article.id',
          'article.name',
          'article.jakoId',
          'article.jakoColorCode',
          'article.jakoColorDescription',
          'jakoCategories.id',
          'category.ident',
          'articleSize.id',
          'articleSize.jakoSizeId',
          'gender.id',
          'gender.gender',
          'gender.cdnImageName',
          'printTemplate.id',
          'printTemplate.imageName',
          'printTemplate.imageSlot',
          'printTemplate.font',
        ])
        .getOne(),
    ).pipe(
      map((order) => OrderService.adjustOrderNumber(order)),
      tap((order) =>
        this.logger.log(`get one order with details ${JSON.stringify(order)}`),
      ),
    );
  }

  findOne(conditions: FindConditions<OrderEntity>): Observable<OrderEntity> {
    return from(
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderLines', 'orderLines')
        .where(conditions)
        .getOne(),
    );
  }

  create(payload: CreateOrderDto): Observable<OkResponseDto> {
    const { orderLines = [], ...rest } = payload;

    return from(
      this.sportclubRepository.findOne({
        id: rest.sportclubId,
      }),
    ).pipe(
      concatMap((sportClub) => {
        const orderEntity = this.orderRepository.create({
          ...rest,
          discount: sportClub.discount,
        });

        if (!isEmpty(orderLines)) {
          orderEntity.orderLines = this.orderLineRepository.create(orderLines);
        }

        this.logger.log(`sportClub entity ${JSON.stringify(sportClub)}`);
        this.logger.log(`order entity ${JSON.stringify(orderEntity)}`);

        return this.orderRepository.save(orderEntity);
      }),
      // concatMap((entity) =>
      //   from(this.orderRepository.getOrderInfoForXmlExport(entity.id)).pipe(
      //     map((orderInfo) =>
      //       this.generateXmlService.generateOrderXml(orderInfo),
      //     ),
      //   ),
      // ),
      map(() => ({ ok: true })),
    );
  }

  update(id: string, payload: UpdateOrderDto): Observable<OrderEntity> {
    const fieldsToUpdate = [
      'status',
      'isDownloaded',
      'isExported',
      'isReadyForExport',
    ];

    return from(this.orderRepository.findOne({ id })).pipe(
      tap(
        (order) =>
          !order && throwNotFoundError(`Order with id=${id} not found!`),
      ),
      concatMap((order) => {
        const orderCopy = cloneDeep(order);

        fieldsToUpdate.forEach((field) => {
          setIfDefined(orderCopy, payload, field);
        });

        return from(this.orderRepository.update({ id }, orderCopy));
      }),
      concatMap(() => from(this.orderRepository.findOne({ id }))),
    );
  }

  findAllForAdmin(haveImages: boolean): Observable<any[]> {
    return from(this.orderRepository.findOrdersForAdmin(haveImages)).pipe(
      map((entities) => entities.map(OrderService.adjustOrderNumber)),
    );
  }

  exportPdf(id: string): Observable<any> {
    return this.orderRepository
      .getOrderDataForExport(id)
      .pipe(
        map((order) => this.orderPdfService.generateInvoicePdf(order, true)),
      );
  }

  deliveryNote(id: string): Observable<any> {
    return this.orderRepository
      .getOrderDataForExport(id)
      .pipe(
        map((order) =>
          this.orderPdfService.generateDeliveryNotePdf(order, true),
        ),
      );
  }

  sendInvoiceEmail(
    id: string,
    payload: SendEmailDto,
  ): Observable<OkResponseDto> {
    return this.orderRepository.getOrderDataForExport(id).pipe(
      map((order) => this.orderPdfService.generateInvoicePdf(order, true)),
      concatMap((pdf) =>
        this.emailService.sendEmailWithAttachment(payload.emails, {
          filename: 'invoice.pdf',
          content: pdf,
        }),
      ),
    );
  }

  getPrintSheet(id: string): Observable<any> {
    return this.orderRepository
      .getOrderDataForPrintSheet(id)
      .pipe(map((order) => this.orderPdfService.generatePrintSheet(order)));
  }

  async generateXmlOrdersAndExportToFtp(): Promise<void> {
    try {
      const orders = await this.orderRepository.getOrdersToExport();
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const xml = await this.orderRepository.getOrderInfoForXmlExport(
          order.id,
        );
        const xmlId = Date.now();
        await this.generateXmlService.generateOrderXml(xml, xmlId);
        const file = await OrderService.getExportedOrderFile(xmlId);
        if (!file) {
          throw new Error('Error reading order generated xml file');
        }
        const localFilePath = `${LOCAL_EXPORTED_IO_DIR}/${file}`;
        const ftpServerFilePath = `${FTP_SERVER_BASE_DIR}/${file}`;
        await this.ftpExportService.uploadFile(
          localFilePath,
          ftpServerFilePath,
        );
        await this.orderRepository.update(
          { id: order.id },
          { isExported: true, exportedTimestamp: new Date() },
        );
        this.logger.log(`Exported order: ${xml.orderId}`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getExportedOrderFile(xmlId: number): Promise<string> {
    const files = fs.readdirSync(LOCAL_EXPORTED_IO_DIR);
    const file = find(files, (f: string) => {
      return f.includes(`${xmlId}.xml`);
    });
    return file;
  }

  private static adjustOrderNumber(order: any): any {
    const number = getPrefixedOrderNumber(order, 'orderNumber');
    const invoiceNumber = getPrefixedInvoiceNumber(order, 'invoiceNumber');

    return {
      ...order,
      number,
      invoiceNumber,
    };
  }
}
