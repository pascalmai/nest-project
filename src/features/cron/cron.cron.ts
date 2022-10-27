import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ImportedOrderService } from '../imported-order/imported-order.service';
import { ImportXmlService } from '../xml/import-xml.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class CronCron {
  private readonly logger = new Logger(CronCron.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly importedOrderService: ImportedOrderService,
    private readonly importXmlService: ImportXmlService,
  ) {}

  @Cron('0 * * * *')
  generateIsExportedOrdersXML() {
    this.logger.log('Starting xml generation and export to ftp server...');

    this.orderService.generateXmlOrdersAndExportToFtp().then(() => {
      this.importedOrderService.generateXmlOrdersAndExportToFtp().then(() => {
        this.logger.log(
          'Generated IMPORTED-ORDERS xml files and  upload to ftp server sucessfully',
        );
      });

      this.logger.log(
        'Generated ORDERS xml files and  upload to ftp server sucessfully',
      );
    });
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async importXmlOrders() {
    await this.importXmlService.processFiles();
  }
}
