import { Injectable } from '@nestjs/common';
import builder from 'xmlbuilder';
import { promises as fsp } from 'fs';

import { XMLExportOrderInfo } from '../../shared/interfaces';
import {
  CITY_TAG_DE,
  CUSTOMER_NUMBER_TAG_DE,
  CUSTOMER_ORDER_NUMBER_TAG_DE,
  DEFAULT_ENCODING,
  DEFAULT_FILE_NAME,
  DESCRIPTION_TAG_DE,
  EAN_TAG_DE,
  INTERNAL_ITEM_NUMBER_TAG_DE,
  ITEM_VARIANT_TAG_DE,
  ORDER_TAG_DE,
  ORDERS_TAG_DE,
  POSITION_TAG_DE,
  POSITIONS_TAG_DE,
  POSTCODE_TAG_DE,
  PRECISION,
  QUANTITY_TAG_DE,
  REFERENCE_TAG_DE,
  SHIP_TO_NAME_TAG_DE,
  LOCAL_EXPORTED_IO_DIR,
  PRICE_TAG_DE,
  EMAIL_TAG_DE,
} from '../../shared/constants';

@Injectable()
export class GenerateXmlService {
  async generateOrderXml(
    orderInfo: XMLExportOrderInfo,
    xmlId: number,
  ): Promise<void> {
    const root = builder.create(ORDERS_TAG_DE, { encoding: DEFAULT_ENCODING });
    const order = root.ele(ORDER_TAG_DE);

    order.ele(REFERENCE_TAG_DE);
    order.ele(CUSTOMER_ORDER_NUMBER_TAG_DE, {}, orderInfo.orderId);
    order.ele(CUSTOMER_NUMBER_TAG_DE, {}, orderInfo.jakoCustomerNumber);
    order.ele(SHIP_TO_NAME_TAG_DE, {}, orderInfo.fullName);
    order.ele(POSTCODE_TAG_DE, {}, orderInfo.postalCode);
    order.ele(CITY_TAG_DE, {}, orderInfo.city);
    order.ele(EMAIL_TAG_DE, {}, orderInfo.email);

    const positions = order.ele(POSITIONS_TAG_DE);

    orderInfo.items.forEach((orderItem) => {
      const position = positions.ele(POSITION_TAG_DE);
      const itemVariant = `${orderItem.jakoId}-${orderItem.jakoColorCode}-${orderItem.jakoSizeId}`;
      const amount = !isNaN(Number(orderItem.amount))
        ? Number(orderItem.amount).toFixed(PRECISION)
        : '0.00';

      position.ele(INTERNAL_ITEM_NUMBER_TAG_DE, {}, orderItem.jakoId);
      position.ele(ITEM_VARIANT_TAG_DE, {}, itemVariant);
      position.ele(EAN_TAG_DE, {}, orderItem.ean);
      position.ele(QUANTITY_TAG_DE, {}, amount);
      position.ele(PRICE_TAG_DE, {}, orderItem.price);
      position.ele(DESCRIPTION_TAG_DE, {}, orderItem.articleName);
    });

    const savePath = `${LOCAL_EXPORTED_IO_DIR}/${DEFAULT_FILE_NAME}_${xmlId}.xml`;

    await fsp.writeFile(
      savePath,
      root.toString({ allowEmpty: true, pretty: true }),
      {
        encoding: DEFAULT_ENCODING,
      },
    );
  }
}
