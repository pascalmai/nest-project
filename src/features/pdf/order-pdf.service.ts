import { Injectable, Logger } from '@nestjs/common';
import { PdfService } from './pdf-service';
import { OrderEntity } from '../order/entities/order.entity';
import get from 'lodash/get';
import map from 'lodash/map';
import each from 'lodash/each';
import reduce from 'lodash/reduce';
import join from 'lodash/join';
import { OrderLineEntity } from '../order/entities/order-line.entity';
import {
  Content,
  ContentColumns,
  ContentTable,
  ContentText,
  Margins,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import cloneDeep from 'lodash/cloneDeep';
import { teamsportLogoBase64 } from '../../shared/constants';
import { ImportedOrderEntity } from '../imported-order/entities/imported-order.entity';
import { ImportedOrderLineEntity } from '../imported-order/entities/imported-order-line.entity';
import { AddressEntity } from '../address/address.entity';
import {
  getPrefixedInvoiceNumber,
  getPrefixedOrderNumber,
} from '../../shared/services';
import { AdditionalOrderEntity } from '../additional-order/additional-order.entity';
import {
  shirtBackIcon,
  shirtFrontIcon,
  shirtSideIcon,
} from '../../assets/images';
import { capitalizeText } from '../../shared/utils';

const LINES_ON_FIRST_PAGE = 7;
const LINES_PER_PAGE = 12;
const DEFAULT_CELL_PADDING = 5;
const DEFAULT_TAX_VALUE = 19;
const THANKS_FOR_ORDER_LINE_2 = `Lieferbedingung: ab Werk`;
const PAYMENT_NOTE = `Unsere Rechnungen sind sofort ohne Abzug zu bezahlen.`;
const THANKS_FOR_ORDER_LINE_3 = `Vielen Dank für die gute Zusammenarbeit.`;
const MISCELLANEOUS_TEXT = `Sonstiges:`;
const PRINT_SHEET_DETAILS_HEADER_TOP = 'OBERTEILE';
const PRINT_SHEET_DETAILS_HEADER_TROUSER = 'HOSEN';
const PRINT_SHEET_DETAILS_HEADER_OTHERS = 'SONSTIGES';
const PRINT_SHEET_DETAILS_ROW_BREAST = 'BRUST';
const PRINT_SHEET_DETAILS_ROW_MOVE = 'RÜCKEN';
const PRINT_SHEET_DETAILS_ROW_SLEEVE = 'ÄRMEL';
const INVOICE_EXPORT = 'Rechnung';
const DELIVERY_NOTE_EXPORT = 'Lieferschein';

@Injectable()
export class OrderPdfService {
  private readonly logger = new Logger(OrderPdfService.name);

  constructor(private readonly pdfService: PdfService) {}

  private numberFormatter = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
  });

  generateInvoicePdf(order: OrderEntity, asStream = false): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const creationDate = OrderPdfService.getFormattedCreationDate(
      order.createdAt,
    );
    const shippingAddress = get(
      order,
      'collection.team.sportclub.shippingAddress',
      null,
    );
    const customerNumber = get(
      order,
      'collection.team.sportclub.customerNumber',
      '',
    );

    const docDefinition: TDocumentDefinitions = {
      content: [
        this.getOrderGeneralInfo({
          creationDate,
          invoiceNumber: getPrefixedInvoiceNumber(order, 'invoiceNumber'),
          customerNumber,
        }),
        ...this.getOrderShippingInfo(shippingAddress),
        {
          columns: [
            {
              margin: [0, 20, 0, 20],
              text: 'Unsere Lieferungen/Leistungen stellen wir Ihnen wie folgt in Rechnung.',
            },
          ],
        },
        ...this.generateOrderLinesTable(order),
        ...this.generateOrderNotes(order),
        {
          text: THANKS_FOR_ORDER_LINE_2,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
        {
          text: THANKS_FOR_ORDER_LINE_3,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
      ],
      pageMargins: [40, 60, 40, 150],
      footer: (currentPage, pageCount) =>
        OrderPdfService.generateFooter(currentPage, pageCount),
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
      },
    };

    const document = printer.createPdfKitDocument(docDefinition, options);

    if (!asStream) {
      document.end();
    }

    return document;
  }

  generateDeliveryNotePdf(
    order: OrderEntity,
    asStream = false,
  ): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const creationDate = OrderPdfService.getFormattedCreationDate(
      order.createdAt,
    );
    const shippingAddress = get(
      order,
      'collection.team.sportclub.shippingAddress',
      null,
    );
    const customerNumber = get(
      order,
      'collection.team.sportclub.customerNumber',
      '',
    );

    const docDefinition: TDocumentDefinitions = {
      content: [
        this.getOrderGeneralInfo({
          creationDate,
          invoiceNumber: getPrefixedInvoiceNumber(order, 'orderNumber'),
          customerNumber,
          exportType: DELIVERY_NOTE_EXPORT,
        }),
        ...this.getOrderShippingInfo(shippingAddress),
        ...this.generateOrderLinesTable(order, true),
        {
          text: THANKS_FOR_ORDER_LINE_2,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
        {
          text: THANKS_FOR_ORDER_LINE_3,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
      ],
      pageMargins: [40, 60, 40, 150],
      footer: (currentPage, pageCount) =>
        OrderPdfService.generateFooter(currentPage, pageCount),
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
      },
    };

    const document = printer.createPdfKitDocument(docDefinition, options);

    if (!asStream) {
      document.end();
    }

    return document;
  }

  generateInvoicePdfForImported(
    order: ImportedOrderEntity,
    asStream = false,
  ): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const { createdAt, orderNumber } = order || {};
    const invoiceNumber = getPrefixedInvoiceNumber(order, 'invoiceNumber');
    const creationDate = OrderPdfService.getFormattedCreationDate(createdAt);
    const shippingAddress = get(order, 'shippingAddress', null);
    const customerNumber = get(order, 'sportclub.customerNumber', '');
    const teamShopName = get(order, 'sportclub.teamShopName', '');
    const teamShopNameFormatted = teamShopName ? `- ${teamShopName}` : '';
    const docDefinition: TDocumentDefinitions = {
      content: [
        this.getOrderGeneralInfo({
          creationDate,
          invoiceNumber,
          customerNumber,
        }),
        ...this.getOrderShippingInfo(shippingAddress),
        {
          columns: [
            {
              margin: [0, 20, 0, 5],
              text: 'Unsere Lieferungen/Leistungen stellen wir Ihnen wie folgt in Rechnung.',
            },
          ],
        },
        {
          columns: [
            {
              margin: [0, 5, 0, 20],
              text: `Bestellung # ${orderNumber} vom ${creationDate} ${teamShopNameFormatted}`,
            },
          ],
        },
        ...this.generateOrderLinesTable(order),
        ...this.generateOrderNotes(order),
        {
          text: THANKS_FOR_ORDER_LINE_2,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
        {
          text: PAYMENT_NOTE,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
        {
          text: THANKS_FOR_ORDER_LINE_3,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
      ],
      pageMargins: [40, 60, 40, 150],
      footer: (currentPage, pageCount) =>
        OrderPdfService.generateFooter(currentPage, pageCount),
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
      },
    };

    const document = printer.createPdfKitDocument(docDefinition, options);

    if (!asStream) {
      document.end();
    }

    return document;
  }

  generateDeliveryNotePdfForImported(
    order: ImportedOrderEntity,
    asStream = false,
  ): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const { createdAt, orderNumber } = order || {};
    const invoiceNumber = getPrefixedInvoiceNumber(order, 'orderNumber', true);
    const creationDate = OrderPdfService.getFormattedCreationDate(createdAt);
    const shippingAddress = get(order, 'shippingAddress', null);
    const customerNumber = get(order, 'sportclub.customerNumber', '');
    const teamShopName = get(order, 'sportclub.teamShopName', '');
    const teamShopNameFormatted = teamShopName ? `- ${teamShopName}` : '';
    const docDefinition: TDocumentDefinitions = {
      content: [
        this.getOrderGeneralInfo({
          creationDate,
          invoiceNumber,
          customerNumber,
          exportType: DELIVERY_NOTE_EXPORT,
        }),
        ...this.getOrderShippingInfo(shippingAddress),
        {
          columns: [
            {
              margin: [0, 5, 0, 20],
              text: `Bestellung # ${orderNumber} vom ${creationDate} ${teamShopNameFormatted}`,
            },
          ],
        },
        ...this.generateOrderLinesTable(order, true),
        {
          text: THANKS_FOR_ORDER_LINE_2,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
        {
          text: THANKS_FOR_ORDER_LINE_3,
          style: 'defaultFont',
          margin: [0, 5, 0, 5],
        },
      ],
      pageMargins: [40, 60, 40, 150],
      footer: (currentPage, pageCount) =>
        OrderPdfService.generateFooter(currentPage, pageCount),
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
      },
    };

    const document = printer.createPdfKitDocument(docDefinition, options);

    if (!asStream) {
      document.end();
    }

    return document;
  }

  generatePrintSheet(order: OrderEntity): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const docDefinition: TDocumentDefinitions = {
      content: [
        ...OrderPdfService.getPrintSheetOrderInfo(order),
        this.generatePrintSheetTable(order),
        this.generatePrintSheetDetailsTable(),
        OrderPdfService.generateMiscellaneousText(),
      ],
      pageMargins: [40, 60, 40, 40],
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
        lineHeader: {
          fillColor: '#D3D3D3',
          bold: true,
        },
      },
    };

    return printer.createPdfKitDocument(docDefinition, options);
  }

  generatePrintSheetForImported(
    order: ImportedOrderEntity,
  ): PDFKit.PDFDocument {
    const printer = this.pdfService.createPrinter();
    const options = {};

    const docDefinition: TDocumentDefinitions = {
      content: [
        ...OrderPdfService.getImportedPrintSheetOrderInfo(order),
        this.generatePrintSheetTableForImported(order),
        this.generatePrintSheetDetailsTable(),
        OrderPdfService.generateMiscellaneousText(),
      ],
      pageMargins: [40, 60, 40, 40],
      styles: {
        defaultFont: {
          fontSize: 10,
        },
        textBold: {
          bold: true,
        },
        lineHeader: {
          fillColor: '#D3D3D3',
          bold: true,
        },
        lineHeaderCenter: {
          fillColor: '#D3D3D3',
          alignment: 'center',
        },
      },
    };

    return printer.createPdfKitDocument(docDefinition, options);
  }

  private getOrderGeneralInfo({
    creationDate,
    customerNumber,
    invoiceNumber,
    exportType,
  }: {
    creationDate: string;
    customerNumber?: string;
    invoiceNumber?: string;
    exportType?: string;
  }): ContentColumns {
    return {
      columns: [
        {
          margin: [0, 0, 0, 20],
          image: `data:image/jpeg;base64,${teamsportLogoBase64}`,
          width: 220,
          height: 80,
        },
        {
          width: '*',
          alignment: 'right',
          margin: [0, 0, 0, 20],
          table: {
            widths: ['*', 120],
            body: [
              [
                {},
                {
                  text: exportType ? exportType : INVOICE_EXPORT,
                  alignment: 'right',
                },
              ],
              [
                `${exportType ? exportType : INVOICE_EXPORT}:`,
                { text: invoiceNumber, alignment: 'right' },
              ],
              [
                'Kundennr:',
                {
                  text: customerNumber,
                  alignment: 'right',
                },
              ],
              [
                'Datum:',
                {
                  text: creationDate,
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],
    };
  }

  private getOrderShippingInfo(
    shippingAddress: AddressEntity,
  ): ContentColumns[] {
    const addressLine1 = get(shippingAddress, 'addressLine1', '');
    const addressLine2 = get(shippingAddress, 'addressLine2', '');

    const shippingAddressLines = [];
    if (addressLine1) {
      shippingAddressLines.push(
        OrderPdfService.newlineAfterComma(addressLine1),
      );
    }

    if (addressLine2) {
      shippingAddressLines.push(
        OrderPdfService.newlineAfterComma(addressLine2),
      );
    }

    return [
      {
        columns: [
          {
            width: 'auto',
            margin: [0, 0, 0, 5],
            text: 'Teamsport Bodensee GmbH, Daimler - Strasse 3, 78256 Steisslingen',
            style: {
              fontSize: 10,
              decoration: 'underline',
            },
          },
        ],
      },
      {
        columns: [
          {
            width: '*',
            text: shippingAddress
              ? `${shippingAddressLines.join('')}
                  ${get(shippingAddress, 'street', '')} ${get(
                  shippingAddress,
                  'houseNumber',
                  '',
                )}
                  ${get(shippingAddress, 'postalCode', '')} ${get(
                  shippingAddress,
                  'city',
                  '',
                )}`
              : '',
          },
          {
            width: 'auto',
            margin: [0, 0, 0, 20],
            alignment: 'right',
            text: `Teamsport Bodensee GmbH
                     Daimler - Strasse 3
                     78256 Steisslingen
                     Tel.: +49 7738 / 8024280
                     info@teamsportbodensee.de
                     www.teamsportbodensee.de`,
          },
        ],
      },
    ];
  }

  private generateOrderLinesTable(
    order: OrderEntity | ImportedOrderEntity,
    isDeliveryNote = false,
  ): ContentTable[] {
    let headers = [
      { text: 'Pos.', style: 'textBold' },
      { text: 'Bezeichnung', style: 'textBold' },
      { text: 'Menge', style: 'textBold', alignment: 'right' },
    ];

    if (!isDeliveryNote) {
      const priceHeaders = [
        { text: 'Einzel €', style: 'textBold', alignment: 'right' },
        { text: 'Rabatt %', style: 'textBold', alignment: 'right' },
        { text: 'Gesamt €', style: 'textBold', alignment: 'right' },
      ];
      headers = [...headers, ...priceHeaders];
    }

    const orderDiscount = order.discount;

    this.logger.log(`Order discount: ${orderDiscount}`);

    const discount = orderDiscount;

    let totalOrderPrice = 0;
    let realTotalAmount = 0;
    let index = 1;
    const linesTableData = reduce(
      order.orderLines,
      (result, orderLine: OrderLineEntity | ImportedOrderLineEntity) => {
        const amount = get(orderLine, 'amount', 0);

        if (!amount) {
          return result;
        }

        const description = OrderPdfService.getArticleDescription(orderLine);
        const { price, priceNumber } = this.getOrderLinePrice(orderLine);
        const { totalNumber } = this.getTotalOrderLinePrice(
          orderLine,
          discount,
        );
        const totalNumberOffset = amount * priceNumber - totalNumber;
        const realTotalNumber = Number(totalNumber + totalNumberOffset).toFixed(
          2,
        );
        const realTotal = this.numberFormatter.format(
          OrderPdfService.toNumber(realTotalNumber),
        );

        realTotalAmount = Number(
          realTotalAmount +
            OrderPdfService.toNumber(get(orderLine, 'price', 0)) * amount,
        );

        totalOrderPrice = Number((totalOrderPrice + totalNumber).toFixed(2));

        let content = {
          index,
          description,
          amount,
        };
        if (!isDeliveryNote) {
          const priceContent = {
            price,
            discount,
            total: realTotal,
            totalNumber: realTotalNumber,
          };
          content = { ...content, ...priceContent };
        }

        result.push(content);

        index++;

        return result;
      },
      [],
    );

    const additionalLinesTableData = reduce(
      order.additionalOrders,
      (result, orderLine: AdditionalOrderEntity) => {
        const amount = get(orderLine, 'amount', 0);

        if (!amount) {
          return result;
        }

        const description = {
          text: [
            { text: orderLine.name, bold: true },
            ...[orderLine.description ? `\n${orderLine.description}` : []],
          ],
        };
        const priceNumber = OrderPdfService.toNumber(
          get(orderLine, 'price', 0),
        );
        const totalNumber = priceNumber * orderLine.amount;
        const price = this.numberFormatter.format(priceNumber);
        const total = this.numberFormatter.format(totalNumber);

        totalOrderPrice = Number((totalOrderPrice + totalNumber).toFixed(2));

        result.push({
          index,
          description,
          amount,
          price,
          discount: '',
          total,
          totalNumber,
        });

        index++;

        return result;
      },
      [],
    );

    linesTableData.push(...additionalLinesTableData);

    const totalLines = linesTableData.length;

    if (totalLines <= LINES_ON_FIRST_PAGE) {
      const data = [];
      each(
        linesTableData,
        ({ index, description, amount, price, discount, total }) => {
          let content = [
            { text: index, alignment: 'center' },
            description,
            { text: amount, alignment: 'right' },
          ];
          if (!isDeliveryNote) {
            const priceContent = [
              { text: price, alignment: 'right' },
              { text: discount, alignment: 'right' },
              { text: total, alignment: 'right' },
            ];
            content = [...content, ...priceContent];
          }
          return data.push(content);
        },
      );

      return [
        {
          style: 'defaultFont',
          table: {
            headerRows: 1,
            heights: 20,
            widths: isDeliveryNote ? [26, '*', 150] : [26, '*', 38, 44, 48, 52],
            dontBreakRows: true,
            body: [headers, ...data],
          },
          layout: {
            hLineWidth: (i) => (i === 0 || i === 1 ? 1 : 0),
            vLineWidth: () => 0,
            paddingTop: () => DEFAULT_CELL_PADDING,
            paddingBottom: () => DEFAULT_CELL_PADDING,
          },
        },
        isDeliveryNote
          ? null
          : this.generateOrderTotalTable(totalOrderPrice, realTotalAmount),
      ];
    }

    const tables = [];
    let transferTotal = 0;
    let subTotal = 0;
    let i = 0;
    let isFirstPagePopulated = false;
    let data = [];

    each(
      linesTableData,
      ({ index, description, amount, price, discount, total, totalNumber }) => {
        if (i >= LINES_ON_FIRST_PAGE && !isFirstPagePopulated) {
          isFirstPagePopulated = true;
          i = 0;
          transferTotal = subTotal;
          data.push([
            { text: 'Zwischensumme', style: 'textBold', colSpan: 5 },
            {},
            {},
            {},
            {},
            {
              text: this.numberFormatter.format(subTotal),
              style: 'textBold',
              alignment: 'right',
            },
          ]);
          tables.push(data);
          // Inserting transfer total row for every new page
          data = [
            [
              { text: 'Übertrag', style: 'textBold', colSpan: 5 },
              {},
              {},
              {},
              {},
              {
                text: this.numberFormatter.format(transferTotal),
                style: 'textBold',
                alignment: 'right',
              },
            ],
          ];
        } else if (i >= LINES_PER_PAGE && index !== totalLines) {
          i = 0;
          transferTotal = subTotal;
          data.push([
            { text: 'Zwischensumme', style: 'textBold', colSpan: 5 },
            {},
            {},
            {},
            {},
            {
              text: this.numberFormatter.format(subTotal),
              style: 'textBold',
              alignment: 'right',
            },
          ]);
          tables.push(data);
          // Inserting transfer total row for every new page
          data = [
            [
              { text: 'Übertrag', style: 'textBold', colSpan: 5 },
              {},
              {},
              {},
              {},
              {
                text: this.numberFormatter.format(transferTotal),
                style: 'textBold',
                alignment: 'right',
              },
            ],
          ];
        }

        i++;
        subTotal = Number((subTotal + totalNumber).toFixed(2));
        data.push([
          { text: index, alignment: 'center' },
          description,
          { text: amount, alignment: 'right' },
          { text: price, alignment: 'right' },
          { text: discount, alignment: 'right' },
          { text: total, alignment: 'right' },
        ]);

        if (index === totalLines) {
          tables.push(data);
        }
      },
    );

    return [
      ...map(tables, (tableData, index) => {
        const headerRowIndexes = index === 0 ? [0, 1] : [0, 1, 2];

        const tableConfig = {
          style: 'defaultFont',
          table: {
            headerRows: 1,
            dontBreakRows: true,
            widths: [26, '*', 38, 44, 48, 52],
            body: [cloneDeep(headers), ...tableData],
          },
          layout: {
            hLineWidth: (rowIndex, node) => {
              const isHeaderRow = headerRowIndexes.includes(rowIndex);
              const isLastRow = rowIndex === node.table.body.length;
              const shouldAddForLastRow =
                isLastRow && index !== tables.length - 1;

              return isHeaderRow || shouldAddForLastRow ? 1 : 0;
            },
            vLineWidth: () => 0,
            paddingTop: () => DEFAULT_CELL_PADDING,
            paddingBottom: () => DEFAULT_CELL_PADDING,
          },
        };

        if (index !== 0) {
          tableConfig['pageBreak'] = 'before';
        }

        return tableConfig;
      }),
      isDeliveryNote
        ? null
        : this.generateOrderTotalTable(totalOrderPrice, realTotalAmount),
    ];
  }

  private generateOrderNotes(order: OrderEntity | ImportedOrderEntity): {
    text: string;
    style: string;
    margin: Margins;
  }[] {
    const { notes } = order;
    return notes.map((item) => ({
      text: `${capitalizeText(item.type)}: ${item.content}`,
      style: 'defaultFont',
      margin: [0, 5, 0, 5],
    }));
  }

  private getOrderLinePrice(
    orderLine: OrderLineEntity | ImportedOrderLineEntity,
  ): { price: string; priceNumber: number } {
    const price = OrderPdfService.toNumber(get(orderLine, 'price', 0)).toFixed(
      2,
    );
    const netPrice = this.getNetPrice(OrderPdfService.toNumber(price));
    return {
      price: this.numberFormatter.format(netPrice),
      priceNumber: netPrice,
    };
  }

  private getTotalOrderLinePrice(
    orderLine: OrderLineEntity | ImportedOrderLineEntity,
    discount = 0,
  ): {
    total: string;
    totalNumber: number;
  } {
    const amount = OrderPdfService.toNumber(get(orderLine, 'amount', 0));
    const price = OrderPdfService.toNumber(get(orderLine, 'price', 0));
    const priceWithDiscount = OrderPdfService.toNumber(
      ((price * (100 - discount)) / 100).toFixed(2),
    );

    let totalNumber = OrderPdfService.toNumber(
      (priceWithDiscount * amount).toFixed(2),
    );

    totalNumber = this.getNetPrice(totalNumber);

    return { total: this.numberFormatter.format(totalNumber), totalNumber };
  }

  private getNetPrice(price: number): number {
    return OrderPdfService.toNumber(
      ((price / (100 + DEFAULT_TAX_VALUE)) * 100).toFixed(2),
    );
  }

  private generateOrderTotalTable(
    totalPrice: number,
    realTotalAmount,
  ): ContentTable {
    const taxValue = Number(
      ((totalPrice * DEFAULT_TAX_VALUE) / 100).toFixed(2),
    );

    const offset = realTotalAmount - totalPrice - taxValue;
    const totalFormatted = this.numberFormatter.format(
      Number((totalPrice + offset).toFixed(2)),
    );
    const taxFormatted = this.numberFormatter.format(taxValue);
    const totalWithTaxFormatted = this.numberFormatter.format(
      Number((taxValue + totalPrice + offset).toFixed(2)),
    );

    return {
      style: 'defaultFont',
      table: {
        widths: [26, '*', 38, 44, 48, 52],
        body: [
          [
            { text: 'Zwischensumme (netto)', colSpan: 5 },
            {},
            {},
            {},
            {},
            { text: totalFormatted, alignment: 'right' },
          ],
          [
            { text: `Umsatzsteuer ${DEFAULT_TAX_VALUE} %`, colSpan: 5 },
            {},
            {},
            {},
            {},
            { text: taxFormatted, alignment: 'right' },
          ],
          [
            { text: 'Gesamtbetrag', style: 'textBold', colSpan: 5 },
            {},
            {},
            {},
            {},
            {
              text: totalWithTaxFormatted,
              style: 'textBold',
              alignment: 'right',
            },
          ],
        ],
      },
      layout: {
        hLineWidth: (i, node) =>
          i === 0 || i === node.table.body.length ? 1 : 0,
        vLineWidth: () => 1,
        paddingTop: () => DEFAULT_CELL_PADDING,
        paddingBottom: () => DEFAULT_CELL_PADDING,
      },
    };
  }

  private generatePrintSheetTable(order: OrderEntity): ContentTable {
    const headers = [
      { text: 'Art.-Nr.', style: 'lineHeader' },
      { text: 'Farbe', style: 'lineHeader' },
      {
        text: 'Größe',
        style: 'lineHeader',
      },
      { text: 'Menge', style: 'lineHeader' },
      { text: 'Druck', style: 'lineHeader' },
    ];

    const orderLinesData = reduce(
      get(order, 'orderLines', []),
      (result, orderLine) => {
        const amount = get(orderLine, 'amount', 0);

        if (!amount) {
          return result;
        }

        const jakoColorDescription = get(
          orderLine,
          'article.jakoColorDescription',
          '',
        );

        const color = `${get(orderLine, 'article.jakoColorCode', '')} ${
          jakoColorDescription === 'default' ? '' : '/' + jakoColorDescription
        }`;
        const imageView = join(
          map(get(orderLine, 'article.printTemplates', []), 'imageSlot'),
          ', ',
        );

        result.push([
          get(orderLine, 'article.jakoId', ''),
          color,
          get(orderLine, 'articleSize.jakoSizeId', ''),
          amount,
          imageView,
        ]);

        return result;
      },
      [],
    );

    return {
      style: 'defaultFont',
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['auto', '*', '*', 'auto', '*'],
        body: [headers, ...orderLinesData],
      },
    };
  }

  private generatePrintSheetDetailsTable(): Content {
    const headers = [
      {
        text: PRINT_SHEET_DETAILS_HEADER_TOP,
        style: 'lineHeader',
        colSpan: 4,
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {
        text: PRINT_SHEET_DETAILS_HEADER_TROUSER,
        style: 'lineHeader',
        border: [true, true, true, true],
      },
      {
        text: PRINT_SHEET_DETAILS_HEADER_OTHERS,
        style: 'lineHeader',
        border: [true, true, true, true],
      },
    ];

    return {
      style: 'defaultFont',
      margin: [0, 10, 0, 10],
      unbreakable: true,
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['auto', 'auto', 'auto', '*', '*', '*'],
        body: [
          headers,
          [
            {
              rowSpan: 3,
              width: 16,
              svg: OrderPdfService.createSvgText(
                PRINT_SHEET_DETAILS_ROW_BREAST,
              ),
              border: [true, true, false, true],
            },
            {
              ...OrderPdfService.generatePrintSheetImage(shirtFrontIcon, 60),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              ...this.generatePrintSheetImageInfoColumns(),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              width: 150,
              text: '',
              rowSpan: 3,
              border: [false, true, false, true],
            },
            { text: 'Position:', border: [true, true, true, false] },
            { text: '', rowSpan: 3, border: [false, true, true, false] },
          ],
          [
            {},
            {},
            {},
            {},
            { text: 'Motiv:', rowSpan: 2, border: [true, false, true, false] },
            {},
          ],
          [{}, {}, {}, {}, {}, {}],
          [
            {
              rowSpan: 3,
              width: 20,
              svg: OrderPdfService.createSvgText(PRINT_SHEET_DETAILS_ROW_MOVE),
              border: [true, false, false, true],
            },
            {
              ...OrderPdfService.generatePrintSheetImage(shirtBackIcon, 60),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              ...this.generatePrintSheetImageInfoColumns(),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              width: 150,
              text: '',
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              text: 'Sonstiges:',
              rowSpan: 3,
              border: [true, false, true, false],
            },
            { text: '', rowSpan: 3, border: [false, false, true, false] },
          ],
          [{}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}],
          [
            {
              rowSpan: 3,
              width: 20,
              svg: OrderPdfService.createSvgText(
                PRINT_SHEET_DETAILS_ROW_SLEEVE,
              ),
              border: [true, false, false, true],
            },
            {
              ...OrderPdfService.generatePrintSheetImage(shirtSideIcon, 50),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              ...this.generatePrintSheetImageInfoColumns(),
              rowSpan: 3,
              border: [false, true, false, true],
            },
            {
              width: 150,
              text: '',
              rowSpan: 3,
              border: [false, true, true, true],
            },
            { text: '', rowSpan: 3, border: [false, false, true, true] },
            { text: '', rowSpan: 3, border: [false, false, true, true] },
          ],
          [{}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  private static createSvgText(text: string) {
    return `
          <svg>
                <text
                  transform="translate(10, 60) rotate(-90)"
                  style="font-size: 10px;"
                >
                ${text}
                </text>
          </svg>     
    `;
  }

  private static generatePrintSheetImage(path: string, width: number) {
    return {
      svg: path,
      style: {
        alignment: 'center',
      },
      width,
    };
  }

  private generatePrintSheetImageInfoColumns() {
    return {
      stack: [
        { text: 'Motiv 1:', margin: [0, 5] },
        { text: 'Motiv 2:', margin: [0, 5] },
        { text: 'Sonstiges:', margin: [0, 5] },
      ],
    };
  }

  private generatePrintSheetTableForImported(
    order: ImportedOrderEntity,
  ): ContentTable {
    const headers = [
      { text: 'Art.-Nr.', style: 'lineHeader' },
      { text: 'Artikelbezeichnung', style: 'lineHeader' },
      { text: 'Farbe', style: 'lineHeader' },
      {
        text: 'Größe',
        style: 'lineHeader',
      },
      { text: 'Menge', style: 'lineHeader' },
      { text: 'Position', style: 'lineHeader' },
      { text: 'Druck/Print', style: 'lineHeader' },
      { text: 'Colour', style: 'lineHeader' },
    ];
    const orderLinesData = reduce(
      get(order, 'orderLines', []),
      (result, orderLine) => {
        const amount = get(orderLine, 'amount', 0);

        if (!amount) {
          return result;
        }

        const jakoColorDescription = get(
          orderLine,
          'article.jakoColorDescription',
          '',
        );

        const color = `${get(orderLine, 'article.jakoColorCode', '')} ${
          jakoColorDescription === 'default' ? '' : '/' + jakoColorDescription
        }`;

        const printTemplate = get(
          orderLine,
          'importedOrderLinePrintTemplate',
          '',
        );

        if (printTemplate && printTemplate.length > 0) {
          each(printTemplate, ({ imageUrl, imageView, imageField }, index) => {
            result.push([
              +index === 0 ? get(orderLine, 'article.jakoId', '') : '',
              +index === 0 ? get(orderLine, 'itemDescription', '') : '',
              +index === 0 ? color : '',
              +index === 0 ? get(orderLine, 'articleSize.jakoSizeId', '') : '',
              +index === 0 ? amount : '',
              imageView,
              imageField,
              imageField === 'Text' && imageUrl ? imageUrl || '' : '',
            ]);
          });
        } else {
          result.push([
            get(orderLine, 'article.jakoId', ''),
            get(orderLine, 'itemDescription', ''),
            color,
            get(orderLine, 'articleSize.jakoSizeId', ''),
            amount,
            '',
            '',
            '',
          ]);
        }

        return result;
      },
      [],
    );

    return {
      style: 'defaultFont',
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['auto', 'auto', '*', '*', 'auto', '*', 'auto', '*'],
        body: [headers, ...orderLinesData],
      },
    };
  }

  private static generateMiscellaneousText(): ContentText {
    return {
      text: MISCELLANEOUS_TEXT,
      style: {
        fontSize: 16,
        bold: true,
      },
      margin: [0, 20, 0, 0],
    };
  }

  private static getPrintSheetOrderInfo(order: OrderEntity): ContentColumns[] {
    const { createdAt } = order || {};
    const creationDate = OrderPdfService.getFormattedCreationDate(createdAt);
    const customerName = get(
      order,
      'collection.team.sportclub.name',
      'collection.team.sportclub.teamShopName',
    );

    return OrderPdfService.generateOrderInfoForPrintSheet({
      creationDate,
      orderNumber: getPrefixedOrderNumber(order, 'orderNumber'),
      customerName,
      phone: order.collection.team.sportclub.contacts[0].phone,
      email: order.collection.team.sportclub.contacts[0].email,
    });
  }

  private static getImportedPrintSheetOrderInfo(
    order: ImportedOrderEntity,
  ): ContentColumns[] {
    const { createdAt, orderNumber } = order || {};
    const creationDate = OrderPdfService.getFormattedCreationDate(createdAt);

    return OrderPdfService.generateOrderInfoForPrintSheet({
      creationDate,
      orderNumber,
      customerName: order?.sportclub?.name || order?.sportclub?.teamShopName,
      teamShopName: order?.sportclub?.teamShopName,
      phone: order.sportclub.contacts[0].phone,
      email: order.sportclub.contacts[0].email,
    });
  }

  private static generateFooter(
    currentPage: number,
    pageCount: number,
  ): Content {
    return [
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [
                  {
                    text: `Teamsport Bodensee GmbH
                               Daimler - Strasse 3
                               78256 Steisslingen
                               Tel.: +49 7738 / 8024280
                               info@teamsportbodensee.de
                               www.teamsportbodensee.de`,
                    margin: [0, 5, 40, 0],
                  },
                  {
                    text: `USt-IdNr.: DE322997726
                               Steuernummer: 18135 / 63247
                               Amtsgericht Freiburg
                               Handelsregister HRB719573
                               Oliver Preiser
                               Norbert Maier`,
                    margin: [0, 5, 0, 0],
                  },
                  {
                    text: `TEAMSPORT BODENSEE GMBH
                               Sparkasse Hegau-Bodensee
                               IBAN: DE86 6925 0035 1055 3008 57
                               BIC: SOLADES1SNG`,
                    margin: [40, 5, 0, 0],
                  },
                ],
              ],
            },
            fontSize: 9,
            layout: {
              hLineWidth: (i) => (i === 0 ? 1 : 0),
              vLineWidth: () => 0,
            },
            margin: [0, 20, 0, 20],
          },
          { width: '*', text: '' },
        ],
      },
      {
        text: `Seize ${currentPage.toString()}/${pageCount}`,
        alignment: 'center',
        fontSize: 9,
      },
    ];
  }

  private static getArticleDescription(
    orderLine: OrderLineEntity | ImportedOrderLineEntity,
  ): ContentText {
    const jakoId = get(orderLine, 'article.jakoId', '');
    const jakoColorCode = get(orderLine, 'article.jakoColorCode', '');
    const jakoSizeId = get(orderLine, 'articleSize.jakoSizeId', '');
    const articleName = get(orderLine, 'article.name', '');
    const jakoColorDescription = get(
      orderLine,
      'article.jakoColorDescription',
      '',
    );

    return {
      text: [
        {
          text: `${jakoId}-${jakoColorCode}${
            jakoSizeId ? '-' + jakoSizeId : ''
          }`,
          bold: true,
        },
        `\n${articleName === 'default' ? '' : articleName} ${
          jakoColorDescription === 'default' ? '' : '-' + jakoColorDescription
        }`,
      ],
    };
  }

  private static toNumber(value: string | number): number {
    const numberValue = Number(value);

    return isNaN(numberValue) ? 0 : numberValue;
  }

  private static getFormattedCreationDate(creationDate: Date): string {
    return `${creationDate.getDate()}.${
      creationDate.getMonth() + 1
    }.${creationDate.getFullYear()}`;
  }

  private static generateOrderInfoForPrintSheet(orderInfo: {
    creationDate: string;
    orderNumber: string;
    customerName?: string;
    teamShopName?: string;
    email?: string;
    phone?: string;
  }): ContentColumns[] {
    const {
      creationDate,
      orderNumber,
      customerName,
      teamShopName,
      email,
      phone,
    } = orderInfo;
    const emailString = email ? email : '';
    const phoneString = phone ? phone : '';

    return [
      {
        columns: [
          {
            width: '*',
            margin: [0, 0, 0, 20],
            alignment: 'left',

            stack: [
              {
                text: 'DRUCKAUFTRAG',
                style: {
                  fontSize: 24,
                  bold: true,
                },
              },
              {
                text: teamShopName,
                margin: [0, 10, 0, 0],
                style: {
                  fontSize: 14,
                },
              },
            ],
          },
          {
            margin: [0, 0, 0, 20],
            alignment: 'right',
            image: `data:image/jpeg;base64,${teamsportLogoBase64}`,
            width: 220,
            height: 80,
          },
        ],
      },
      {
        columns: [
          {
            width: '*',
            alignment: 'left',
            margin: [0, 0, 0, 20],
            text: [
              `Kunde: ${customerName}\n\n\n`,
              `Anschprechpartner:\n\n`,
              `Tel.: ${phoneString}-E-Mail: ${emailString}`,
            ],
          },
          {
            width: 220,
            alignment: 'right',
            style: 'defaultFont',
            table: {
              widths: ['auto', '*'],
              dontBreakRows: true,
              body: [
                [
                  { text: 'Auftrags-Nr.:', alignment: 'left' },
                  { text: orderNumber, alignment: 'right' },
                ],
                [
                  { text: 'Datum:', alignment: 'left' },
                  { text: creationDate, alignment: 'right' },
                ],
              ],
            },
            layout: {
              hLineWidth: (rowIndex, node) => {
                const isFirstRow = rowIndex === 0;
                const isLastRow = rowIndex === node.table.body.length;

                return isFirstRow || isLastRow ? 1 : 0;
              },
              vLineWidth: (index, node) => {
                const isFirstColumn = index === 0;
                const isLastColumn = index === node.table.widths.length;

                return isFirstColumn || isLastColumn ? 1 : 0;
              },
              paddingTop: () => DEFAULT_CELL_PADDING,
              paddingBottom: () => DEFAULT_CELL_PADDING,
            },
          },
        ],
      },
    ];
  }

  private static newlineAfterComma(str: string) {
    return str.replace(/,/g, ',\n');
  }
}
