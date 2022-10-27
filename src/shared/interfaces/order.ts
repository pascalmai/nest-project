import { AC_ORDER_STATUS } from '../enums';

export interface OrdersResponse {
  id: string;
  createdAt: string;
  itemsCount: string;
  totalPrice: string;
}

export interface XMLExportOrderItem {
  jakoId: string;
  jakoColorCode: string;
  jakoSizeId: string;
  ean: string;
  amount: string;
  price: string;
  articleName: string;
  font: string;
  printText: string;
}
export interface XMLExportOrderInfo {
  orderId: string;
  sportclubid?: string;
  jakoCustomerNumber?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  fullName?: string;
  items: XMLExportOrderItem[];
}

export interface FindOrdersPayload {
  collectionId?: string;
  teamId?: string;
  sportclubId?: string;
}

export interface ImportedOrderResponse {
  id: string;
  createdAt: string;
  itemsCount: number;
  totalPrice: number;
  discount: number;
  number: number;
  customerName: string;
  jakoCustomerNumber: string;
  status: AC_ORDER_STATUS;
  isDownloaded: boolean;
  isExported: boolean;
  isReadyForExport: boolean;
  haveImages: boolean;
  isImported: boolean;
  invoiceNumber: number | string;
}

export interface ImportOrderResponse {
  successes: Array<string>;
  errors: Array<any>;
}
