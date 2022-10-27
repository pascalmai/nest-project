import { Injectable, Logger } from '@nestjs/common';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { FindConditions } from 'typeorm';
import { ImportedOrderRepository } from './repositories/imported-order.repository';
import { concatMap, forkJoin, from, map, Observable, of, tap } from 'rxjs';
import { ImportedOrderResponse } from '../../shared/interfaces';
import { ImportedOrderEntity } from './entities/imported-order.entity';
import { UpdateImportedOrderDto } from './imported-order.dto';
import { throwNotFoundError } from '../../shared/errors';
import { setIfDefined, stringToBoolean } from '../../shared/services';
import { OrderService } from '../order/order.service';
import { OrderPdfService } from '../pdf/order-pdf.service';
import { OkResponseDto, SendEmailDto } from '../../shared/dto';
import { EmailService } from '../email/email.service';
import { AddressEntity } from '../address/address.entity';
import { FtpExportService } from '../ftp-export/ftp-export.service';
import {
  FTP_SERVER_BASE_DIR,
  LOCAL_EXPORTED_IO_DIR,
} from 'src/shared/constants';
import { GenerateXmlService } from '../xml/generate-xml.service';

@Injectable()
export class ImportedOrderService {
  private readonly logger = new Logger(ImportedOrderService.name);
  constructor(
    private readonly importedOrderRepository: ImportedOrderRepository,
    private readonly orderService: OrderService,
    private readonly orderPdfService: OrderPdfService,
    private readonly emailService: EmailService,
    private readonly ftpExportService: FtpExportService,
    private readonly generateXmlService: GenerateXmlService,
  ) {}

  findMany(haveImagesString: string): Observable<ImportedOrderResponse[]> {
    const haveImages = stringToBoolean(haveImagesString);
    return forkJoin([
      from(this.importedOrderRepository.findOrders(haveImages)),
      this.orderService.findAllForAdmin(haveImages),
    ]).pipe(
      concatMap(([importedOrders, orders]) =>
        of([...importedOrders, ...orders]),
      ),
    );
  }

  update(
    id: string,
    payload: UpdateImportedOrderDto,
  ): Observable<ImportedOrderEntity> {
    const fieldsToUpdate = ['status', 'isDownloaded'];

    return from(this.importedOrderRepository.findOne({ id })).pipe(
      tap(
        (order) =>
          !order && throwNotFoundError(`Order with id=${id} not found!`),
      ),
      concatMap((order) => {
        const addressFieldsToUpdate = [
          'addressLine1',
          'addressLine2',
          'street',
          'houseNumber',
          'city',
          'postalCode',
        ];
        const { shippingAddress: entityShippingAddress, ...orderCopy } =
          cloneDeep(order);
        const clonedShippingAddress = cloneDeep(entityShippingAddress) || {};
        if (!isEmpty(payload.shippingAddress)) {
          addressFieldsToUpdate.forEach((field) => {
            setIfDefined<AddressEntity>(
              clonedShippingAddress,
              payload.shippingAddress,
              field,
            );
          });
        }
        if (!isEmpty(clonedShippingAddress)) {
          orderCopy['shippingAddress'] = clonedShippingAddress;
        }
        if (!order.isExported && payload.isReadyForExport !== null) {
          fieldsToUpdate.push('isReadyForExport');
        }
        fieldsToUpdate.forEach((field) => {
          setIfDefined(orderCopy, payload, field);
        });

        return from(this.importedOrderRepository.save(orderCopy));
      }),
      concatMap(() => this.findOne({ id })),
    );
  }

  findOne(
    conditions: FindConditions<ImportedOrderEntity>,
  ): Observable<ImportedOrderEntity> {
    return from(
      this.importedOrderRepository.findOne(conditions, {
        relations: [
          'shippingAddress',
          'orderLines',
          'orderLines.articleSize',
          'orderLines.article',
          'orderLines.articleSize.gender',
          'orderLines.importedOrderLinePrintTemplate',
        ],
      }),
    ).pipe(
      map((item) => ({ ...item, isImported: true } as ImportedOrderEntity)),
    );
  }

  exportPdf(id: string): Observable<any> {
    return this.importedOrderRepository
      .getOrderDataForExport(id)
      .pipe(
        map((order) =>
          this.orderPdfService.generateInvoicePdfForImported(order, true),
        ),
      );
  }

  deliveryNote(id: string): Observable<any> {
    return this.importedOrderRepository
      .getOrderDataForExport(id)
      .pipe(
        map((order) =>
          this.orderPdfService.generateDeliveryNotePdfForImported(order, true),
        ),
      );
  }

  sendInvoiceEmail(
    id: string,
    payload: SendEmailDto,
  ): Observable<OkResponseDto> {
    return this.importedOrderRepository.getOrderDataForExport(id).pipe(
      map((order) =>
        this.orderPdfService.generateInvoicePdfForImported(order, false),
      ),
      concatMap((pdf) =>
        this.emailService.sendEmailWithAttachment(
          payload.emails,
          {
            filename: 'invoice.pdf',
            content: pdf,
          },
          undefined,
          payload.emailContent,
        ),
      ),
    );
  }

  getPrintSheet(id: string): Observable<any> {
    return this.importedOrderRepository
      .getOrderDataForPrintSheet(id)
      .pipe(
        map((order) =>
          this.orderPdfService.generatePrintSheetForImported(order),
        ),
      );
  }

  async generateXmlOrdersAndExportToFtp(): Promise<void> {
    try {
      const orders =
        await this.importedOrderRepository.getImportedOrdersToExport();

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const xml = await this.importedOrderRepository.getOrderInfoForXmlExport(
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
        await this.importedOrderRepository.update(
          { id: order.id },
          { isExported: true, exportedTimestamp: new Date() },
        );
        this.logger.log(`Exported imported-order: ${order.id}`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
