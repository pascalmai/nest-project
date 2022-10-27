import map from 'lodash/map';
import get from 'lodash/get';
import { EntityRepository, Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import {
  FindOrdersPayload,
  XMLExportOrderInfo,
} from '../../../shared/interfaces';
import { from, Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {
  private readonly logger = new Logger(OrderRepository.name);

  async findOrders(payload: FindOrdersPayload): Promise<any[]> {
    const whereStatement = OrderRepository.getOrdersWhereStatement(payload);
    const params = OrderRepository.getOrdersParams(payload);

    const orders = await this.query(
      `
          select at2."name"                  as "teamName",
                 ac."name"                   as "collectionName",
                 ao.id                       as "id",
                 ao.order_number             as "orderNumber",
                 ao.created_at               as "createdAt",
                 ao.discount                 as "discount",  
                 count(aol.id)               as "itemsCount",
                 sum(aol.price * aol.amount) as "totalPrice"
          from ac_order ao
                   left join ac_order_line aol on
              aol.order_id = ao.id
                   left join ac_collection ac on
              ac.id = ao.collection_id
                   left join ac_team at2 on
              at2.id = ac.team_id
              ${whereStatement}
          group by
              at2."name",
              ac."name",
              ao.id
          order by
              at2."name" asc,
              ac."name" asc,
              ao.created_at desc
      `,
      params,
    );

    this.logger.log(`find orders: ${JSON.stringify(orders)}`);

    return this.getOrdersWithAdditionalOrdersPrice(orders);
  }
  async findOrdersForAdmin(haveImages: boolean): Promise<any[]> {
    const whereStatement = haveImages ? `having count(apt.id) > 0` : '';

    const orders = await this.query(`
        select ao.id                       as "id",
               ao.created_at               as "createdAt",
               ao.order_number             as "orderNumber",
               as2.name                    as "customerName",
               as2.jako_customer_number    as "jakoCustomerNumber",
               ao.discount                 as "discount",
               ao.status                   as "status",
               ao.is_downloaded            as "isDownloaded",
               ao.is_exported              as "isExported",
               ao.is_ready_for_export      as "isReadyForExport",
               count(aol.id)               as "itemsCount",
               aol.price                   as "price",
               sum(aol.price * aol.amount) as "totalPrice",
               count(apt.id) > 0           as "haveImages",
               false                       as "isImported"
        from ac_order ao
                 left join ac_order_line aol on
            aol.order_id = ao.id
                 left join ac_collection ac on
            ac.id = ao.collection_id
                 left join ac_print_template apt on
            apt.collection_id = ac.id and apt.article_id = aol.article_id
                 left join ac_team at2 on
            at2.id = ac.team_id
                 left join ac_sportclub as2 on
            as2.id = at2.sportclub_id
        group by ao.id,
                 as2."name",
                 as2.jako_customer_number,
                 as2.discount,
                 "aol".price
            ${whereStatement}
        order by ao.created_at desc`);

    this.logger.log(`find orders for admin: ${JSON.stringify(orders)}`);

    return this.getOrdersWithAdditionalOrdersPrice(orders);
  }

  async getOrdersWithAdditionalOrdersPrice(orders: any[]) {
    const additionalOrders = await this.query(
      `
            select aao.id                           as "id", 
                   ao.id                           as "order_id",
                   sum(aao.amount * aao.price)      as "totalPrice"
                    from ac_order ao 
                    join ac_additional_order aao on ao.id = aao.order_id 
                    group by ao.id, aao.id
        `,
    );

    this.logger.log(
      `find orders additional orders: ${JSON.stringify(additionalOrders)}`,
    );

    let totalPrice = 0;
    for (const order of orders) {
      for (const additionalOrder of additionalOrders) {
        if (order.id === additionalOrder.order_id) {
          totalPrice += Number(additionalOrder.totalPrice);
        }
      }
      totalPrice += order.discount
        ? (Number(order.totalPrice) / 100) * (100 - Number(order.discount))
        : Number(order.totalPrice);
      order.totalPrice = totalPrice;
      totalPrice = 0;
    }

    this.logger.log(
      `find orders union additional orders with full price: ${JSON.stringify(
        orders,
      )}`,
    );

    const newImportedOrders = [];

    orders.forEach((order) => {
      const filtered = orders.filter((o) => o.number === order.number);

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
        orders = orders.filter((o) => o.number !== order.number);
      }
    });

    return orders;
  }

  async findCollectionArticles(collectionId: string): Promise<string[]> {
    const whereStatement = collectionId ? 'where aca.collection_id = $1' : '';
    const params = collectionId ? [collectionId] : undefined;

    const items = await this.query(
      `
          select aca.article_id as "articleId"
          from ac_collection_article aca
              ${whereStatement}`,
      params,
    );

    return map(items, (item) => get(item, 'articleId'));
  }

  async getOrderInfoForXmlExport(id: string): Promise<XMLExportOrderInfo> {
    const result = await this.query(
      `select ao.id                         as "orderId",
              ao.sportclub_id               as "sportclubId",
              acsc.jako_customer_number     as "jakoCustomerNumber",
              aca.city                      as "city",
              aca.postal_code               as "postalCode",
              acscc.email                   as "email",
              acscc.full_name               as "fullName"
       from ac_order ao
          left join ac_sportclub acsc on
       acsc.id = ao.sportclub_id
          left join ac_address aca on
       aca.id = acsc.shipping_address_id
          left join ac_sportclub_contact acscc on
       acscc.sportclub_id = ao.sportclub_id
       where ao.id = $1`,
      [id],
    );

    const orderId = get(result, `[0].orderId`);

    const items = await this.query(
      `
          select aa.jako_id         as "jakoId",
                 aa.jako_color_code as "jakoColorCode",
                 aas.jako_size_id   as "jakoSizeId",
                 aas.ean            as "ean",
                 aol.amount         as "amount",
                 aol.price          as "price",
                 aa.name            as "articleName",
                 apt.font           as "font",
                 aol.print_text     as "printText"
          from ac_order_line aol
                   left join ac_article aa on
              aa.id = aol.article_id
                   left join ac_article_size aas on
              aas.id = aol.article_size_id
                   left join ac_order ao on
              ao.id = aol.order_id
                   left join ac_collection ac on
              ac.id = ao.collection_id
                   left join ac_print_template apt on
                      apt.article_id = aol.article_id
                  and apt.collection_id = ac.id
          where aol.order_id = $1
            and aol.amount > 0
          group by aol.id,
                   aa.jako_id,
                   aa.jako_color_code,
                   aas.jako_size_id,
                   aas.ean,
                   aol.amount,
                   aol.price,
                   aa.name,
                   apt.font,
                   aol.print_text;
      `,
      [orderId],
    );

    return { ...result[0], items };
  }

  getOrderDataForExport(id: string): Observable<OrderEntity> {
    const qb = this.createQueryBuilder('order');

    qb.where({ id })
      .leftJoin('order.collection', 'collection')
      .leftJoin('order.orderLines', 'orderLines')
      .leftJoin('order.additionalOrders', 'additionalOrders')
      .leftJoin('order.notes', 'notes')
      .leftJoin('orderLines.article', 'article')
      .leftJoin('orderLines.articleSize', 'articleSize')
      .leftJoin('articleSize.gender', 'gender')
      .leftJoin('collection.team', 'team')
      .leftJoin('team.sportclub', 'sportclub')
      .leftJoin('sportclub.shippingAddress', 'shippingAddress')
      .select([
        'order.id',
        'order.createdAt',
        'order.orderNumber',
        'order.status',
        'order.discount',
        'collection.id',
        'collection.name',
        'team.id',
        'team.name',
        'sportclub.id',
        'sportclub.jakoCustomerNumber',
        'sportclub.customerNumber',
        'sportclub.discount',
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
        'additionalOrders.id',
        'additionalOrders.name',
        'additionalOrders.description',
        'additionalOrders.price',
        'additionalOrders.amount',
        'notes.id',
        'notes.type',
        'notes.content',
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
          `get order for export in pdf: ${JSON.stringify(order)}`,
        ),
      ),
    );
  }

  getOrderDataForPrintSheet(id: string): Observable<OrderEntity> {
    const qb = this.createQueryBuilder('order');

    qb.where({ id })
      .leftJoin('order.collection', 'collection')
      .leftJoin('order.orderLines', 'orderLines')
      .leftJoin('orderLines.article', 'article')
      .leftJoin(
        'article.printTemplates',
        'printTemplate',
        'printTemplate.collection_id = collection.id',
      )
      .leftJoin('orderLines.articleSize', 'articleSize')
      .leftJoin('collection.team', 'team')
      .leftJoin('team.sportclub', 'sportclub')
      .leftJoin('sportclub.contacts', 'contacts')
      .select([
        'order.id',
        'order.createdAt',
        'order.orderNumber',
        'collection.id',
        'team.id',
        'sportclub.id',
        'sportclub.jakoCustomerNumber',
        'sportclub.customerNumber',
        'sportclub.name',
        'sportclub.teamShopName',
        'contacts.phone',
        'contacts.email',
        'orderLines.id',
        'orderLines.amount',
        'article.id',
        'article.jakoId',
        'article.jakoColorCode',
        'article.jakoColorDescription',
        'printTemplate.id',
        'printTemplate.id',
        'printTemplate.imageSlot',
        'articleSize.id',
        'articleSize.jakoSizeId',
      ]);

    return from(qb.getOne());
  }

  getOrdersToExport(): Promise<OrderEntity[]> {
    return this.createQueryBuilder('order')
      .where({ isExported: false, isReadyForExport: true })
      .getMany();
  }

  private static getOrdersWhereStatement(payload: FindOrdersPayload): string {
    const { collectionId, teamId } = payload;

    if (!collectionId && !teamId) {
      return `where ao.sportclub_id = $1`;
    }

    return `where ao.sportclub_id = $1 AND ${
      collectionId ? `ao.collection_id = $2` : teamId ? `at2.id = $2` : ''
    }`;
  }

  private static getOrdersParams(
    payload: FindOrdersPayload,
  ): [string, string?] {
    const { sportclubId, collectionId, teamId } = payload;

    if (!collectionId && !teamId) {
      return [sportclubId];
    }

    return collectionId
      ? [sportclubId, collectionId]
      : teamId
      ? [sportclubId, teamId]
      : undefined;
  }
}
