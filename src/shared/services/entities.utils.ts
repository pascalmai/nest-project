import get from 'lodash/get';
import has from 'lodash/has';
import isNil from 'lodash/isNil';
import { DeepPartial, ValueTransformer } from 'typeorm';
import { OrderEntity } from '../../features/order/entities/order.entity';
import { ImportedOrderEntity } from '../../features/imported-order/entities/imported-order.entity';

export const setIfDefined = <T>(
  target: DeepPartial<T>,
  source: DeepPartial<T>,
  field: string,
): void => {
  if (has(source, field)) {
    target[field] = get(source, field);
  }
};

export const getPrefixedOrderNumber = (
  order: OrderEntity | ImportedOrderEntity,
  numberField: string,
): string => {
  const orderNumberLength = Number(process.env.ORDER_NUMBER_LENGTH || 0);
  const newOrderNumber = `${get(order, numberField, '')}`.padStart(
    orderNumberLength,
    '0',
  );

  return `${process.env.ORDER_NUMBER_PREFIX}${newOrderNumber}`;
};

export const getPrefixedInvoiceNumber = (
  order: OrderEntity | ImportedOrderEntity,
  numberField: string,
  isDeliveryNote?: boolean,
): string => {
  const currentYear = (order.createdAt || new Date()).getFullYear();
  const yearLastTwoDigits = `${currentYear}`.slice(2);
  const number = String(get(order, numberField, '') || '-').padStart(6, '0');
  return `${
    isDeliveryNote
      ? process.env.DELIVERY_NOTE_NUMBER_PREFIX
      : process.env.INVOICE_NUMBER_PREFIX
  }${yearLastTwoDigits}/${number}`;
};

/**
 * node-pg-types by default will return numeric column value as a string.
 * so this transformer can convert such values to a number, where it needs to
 */
export class ColumnNumericTransformer implements ValueTransformer {
  to(data?: number | null): number | null {
    return isNil(data) ? null : data;
  }

  from(data?: string | null): number | null {
    if (!isNil(data)) {
      const res = parseFloat(data);

      return isNaN(res) ? null : res;
    }

    return null;
  }
}
