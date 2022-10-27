import { EntityRepository, Repository } from 'typeorm';
import { ImportedOrderEntity } from '../entities/imported-order.entity';
import {
  ImportedOrderResponse,
  XMLExportOrderInfo,
} from '../../../shared/interfaces';
import { from, Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';
import get from 'lodash/get';
import { getPrefixedInvoiceNumber } from 'src/shared/services';

@EntityRepository(ImportedOrderEntity)
export class ImportedOrderRepository extends Repository<ImportedOrderEntity> {
  private readonly logger = new Logger(ImportedOrderRepository.name);

  async findOrders(haveImages: boolean): Promise<ImportedOrderResponse[]> {
    const whereStatement = haveImages
      ? `where aiolpt.image_url is not null`
      : '';

    let importedOrders: ImportedOrderResponse[] = await this.query(
      `
          select aio.id                               as "id",
                 aio.created_at                       as "createdAt",
                 aio.order_number                     as "number",
                 aio.invoice_number                   as "invoiceNumber",
                 "sc".name                            as "customerName",
                 "sc".jako_customer_number            as "jakoCustomerNumber",
                 "sc".team_shop_name                  as "teamShopName",
                 aio.discount                         as "discount",
                 aio.status                           as "status",
                 aio.is_exported                      as "isExported",
                 aio.is_ready_for_export              as "isReadyForExport",
                 count(aiol.id)                       as "itemsCount",
                 aiol.price                           as "price",
                 sum(aiol.price * aiol.amount)        as "totalPrice",
                 bool_and(aiolpt.image_url is not null) as "haveImages",
                 true                                 as "isImported"
          from ac_imported_order aio
                   left join ac_imported_order_line aiol on
              aiol.order_id = aio.id
                  left join ac_imported_order_line_print_template aiolpt on
              aiolpt.order_line_id = aiol.id
                   join ac_sportclub as "sc" on
              "sc".id = aio.sportclub_id
              ${whereStatement}
          group by aio.id,
              "sc".name, "sc".jako_customer_number, "sc".id, "aiol".price
          order by aio.created_at desc
      `,
    );

    this.logger.log(`find imported orders: ${JSON.stringify(importedOrders)}`);

    const additionalOrders = await this.query(
      `
            select aao.id                           as "id", 
                   aio.id                           as "imported_order_id",
                   sum(aao.amount * aao.price)      as "totalPrice"
                    from ac_imported_order aio 
                    join ac_additional_order aao on aio.id = aao.imported_order_id 
                    group by aio.id, aao.id
        `,
    );

    this.logger.log(
      `find additional orders: ${JSON.stringify(additionalOrders)}`,
    );

    let totalPrice = 0;
    for (const importedOrder of importedOrders) {
      for (const additionalOrder of additionalOrders) {
        if (importedOrder.id === additionalOrder.imported_order_id) {
          totalPrice += Number(additionalOrder.totalPrice);
        }
      }
      totalPrice += importedOrder.discount
        ? (Number(importedOrder.totalPrice) / 100) *
          (100 - Number(importedOrder.discount))
        : Number(importedOrder.totalPrice);
      importedOrder.totalPrice = totalPrice;
      totalPrice = 0;

      importedOrder.invoiceNumber = getPrefixedInvoiceNumber(
        importedOrder as unknown as ImportedOrderEntity,
        'invoiceNumber',
      );
    }

    this.logger.log(
      `find imported orders union additional orders with full price: ${JSON.stringify(
        importedOrders,
      )}`,
    );

    const newImportedOrders: ImportedOrderResponse[] = [];

    importedOrders.forEach((order) => {
      const filtered = importedOrders.filter((o) => o.number === order.number);

      const newOrder = filtered[0];
      if (newOrder) {
        filtered.forEach((o, i) => {
          if (i !== 0) {
            if (o.itemsCount)
              newOrder.itemsCount =
                Number(newOrder.itemsCount) + Number(o.itemsCount);
            if (o.totalPrice)
              newOrder.totalPrice = newOrder.totalPrice + o.totalPrice;
          }
        });
        newImportedOrders.push(newOrder);
        importedOrders = importedOrders.filter(
          (o) => o.number !== order.number,
        );
      }
    });

    return newImportedOrders;
  }

  async getOrderInfoForXmlExport(id: string): Promise<XMLExportOrderInfo> {
    const result = await this.query(
      `select aio.id                        as "orderId",
              aio.sportclub_id              as "sportclubId",
              acsc.jako_customer_number     as "jakoCustomerNumber",
              aca.city                      as "city",
              aca.postal_code               as "postalCode",
              acscc.email                   as "email",
              acscc.full_name               as "fullName"
       from ac_imported_order aio
          left join ac_sportclub acsc on
       acsc.id = aio.sportclub_id
          left join ac_address aca on
       aca.id = aio.shipping_address_id
          left join ac_sportclub_contact acscc on
       acscc.sportclub_id = aio.sportclub_id
       where aio.id = $1`,
      [id],
    );

    const orderId = get(result, `[0].orderId`);

    const items = await this.query(
      `
          select aa.jako_id         as "jakoId",
                 aiol.font_color    as "jakoColorCode",
                 aas.jako_size_id   as "jakoSizeId",
                 aas.ean            as "ean",
                 aiol.amount        as "amount",
                 aiol.price         as "price",
                 aa.name            as "articleName",
                 aiol.font_family   as "font",
                 aiol.print_text    as "printText"
          from ac_imported_order_line aiol
                   left join ac_article aa on
              aa.id = aiol.article_id
                   left join ac_article_size aas on
              aas.id = aiol.article_size_id
          where aiol.order_id = $1
            and aiol.amount > 0
          group by aiol.id,
                   aa.jako_id,
                   aiol.font_color,
                   aas.jako_size_id,
                   aas.ean,
                   aiol.amount,
                   aiol.price,
                   aa.name,
                   aiol.font_family,
                   aiol.print_text;
      `,
      [orderId],
    );

    return { ...result[0], items };
  }

  getOrderDataForExport(id: string): Observable<ImportedOrderEntity> {
    const qb = this.createQueryBuilder('order');

    qb.where({ id })
      .leftJoin('order.orderLines', 'orderLines')
      .leftJoin('orderLines.article', 'article')
      .leftJoin('orderLines.articleSize', 'articleSize')
      .leftJoin('articleSize.gender', 'gender')
      .leftJoin('order.shippingAddress', 'shippingAddress')
      .leftJoin('order.sportclub', 'sportclub')
      .leftJoin('order.additionalOrders', 'additionalOrders')
      .leftJoin('order.notes', 'notes')
      .select([
        'additionalOrders.id',
        'additionalOrders.name',
        'additionalOrders.description',
        'additionalOrders.amount',
        'additionalOrders.price',
        'notes.id',
        'notes.type',
        'notes.content',
        'order.id',
        'order.createdAt',
        'order.orderNumber',
        'order.invoiceNumber',
        'order.status',
        'sportclub.customerNumber',
        'sportclub.jakoCustomerNumber',
        'sportclub.teamShopName',
        'shippingAddress.id',
        'shippingAddress.addressLine1',
        'shippingAddress.addressLine2',
        'shippingAddress.street',
        'shippingAddress.houseNumber',
        'shippingAddress.postalCode',
        'shippingAddress.city',
        'orderLines.id',
        'orderLines.price',
        'orderLines.amount',
        'orderLines.itemDescription',
        'article.id',
        'article.jakoId',
        'article.name',
        'article.jakoColorCode',
        'article.jakoCategoryId',
        'article.jakoColorDescription',
        'articleSize.id',
        'articleSize.jakoSizeId',
        'articleSize.ean',
        'gender.id',
        'gender.gender',
      ]);

    return from(qb.getOne()).pipe(
      tap((order) =>
        this.logger.log(
          `get imported order for export in pdf: ${JSON.stringify(order)}`,
        ),
      ),
    );
  }

  getOrderDataForPrintSheet(id: string): Observable<ImportedOrderEntity> {
    const qb = this.createQueryBuilder('order');

    qb.where({ id })
      .leftJoin('order.orderLines', 'orderLines')
      .leftJoin('orderLines.article', 'article')
      .leftJoin('orderLines.articleSize', 'articleSize')
      .leftJoin(
        'orderLines.importedOrderLinePrintTemplate',
        'importedOrderLinePrintTemplate',
      )
      .leftJoin('articleSize.gender', 'gender')
      .leftJoin('order.sportclub', 'sportclub')
      .leftJoin('sportclub.contacts', 'contacts')
      .select([
        'order.id',
        'order.createdAt',
        'order.orderNumber',
        'sportclub.jakoCustomerNumber',
        'sportclub.teamShopName',
        'contacts.email',
        'contacts.phone',
        'sportclub.name',
        'orderLines.id',
        'orderLines.amount',
        'orderLines.itemDescription',
        'orderLines.printText',
        'article.id',
        'article.jakoId',
        'article.jakoColorCode',
        'article.jakoColorDescription',
        'articleSize.id',
        'articleSize.jakoSizeId',
        'importedOrderLinePrintTemplate.id',
        'importedOrderLinePrintTemplate.imageUrl',
        'importedOrderLinePrintTemplate.imageField',
        'importedOrderLinePrintTemplate.imageView',
      ]);

    return from(qb.getOne());
  }

  findOrder(id: string) {
    const qb = this.createQueryBuilder('order');

    return from(
      qb
        .where({ id })
        .leftJoinAndSelect('order.orderLines', 'orderLines')
        .leftJoinAndSelect('orderLines.article', 'article')
        .leftJoinAndSelect('orderLines.articleSize', 'articleSize')
        .leftJoinAndSelect('articleSize.gender', 'gender')
        .leftJoinAndSelect('order.sportclub', 'sportclub')
        .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
        .select([
          'order.id',
          'order.orderNumber',
          'sportclub.jakoCustomerNumber',
          'order.discount',
          'order.status',
          'order.isDownloaded',
          'order.isExported',
          'order.createdAt',
          'orderLines.id',
          'orderLines.price',
          'orderLines.amount',
          'orderLines.printNumber',
          'orderLines.printText',
          'orderLines.imageUrl',
          'orderLines.imageView',
          'orderLines.fontFamily',
          'orderLines.fontColor',
          'orderLines.textView',
          'article.id',
          'article.name',
          'article.jakoId',
          'article.jakoColorCode',
          'article.jakoColorDescription',
          'articleSize.id',
          'articleSize.jakoSizeId',
          'gender.id',
          'gender.gender',
          'gender.cdnImageName',
          'shippingAddress.addressLine1',
          'shippingAddress.addressLine2',
          'shippingAddress.street',
          'shippingAddress.houseNumber',
          'shippingAddress.postalCode',
          'shippingAddress.city',
        ])
        .getOne(),
    );
  }

  getImportedOrdersToExport(): Promise<ImportedOrderEntity[]> {
    return this.createQueryBuilder('order')
      .where({ isExported: false, isReadyForExport: true })
      .getMany();
  }
}
