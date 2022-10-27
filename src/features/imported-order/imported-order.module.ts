import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportedOrderRepository } from './repositories/imported-order.repository';
import { ImportedOrderLineRepository } from './repositories/imported-order-line.repository';
import { ImportedOrderController } from './imported-order.controller';
import { ImportedOrderService } from './imported-order.service';
import { OrderModule } from '../order/order.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';
import { ImportXmlService } from '../xml/import-xml.service';
import { FtpExportModule } from '../ftp-export/ftp-export.module';
import { XmlModule } from '../xml/xml.module';
import { ImportedOrderLinePrintTemplateRepository } from './repositories/imported-order-line-print-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportedOrderRepository,
      ImportedOrderLineRepository,
      ImportedOrderLinePrintTemplateRepository,
    ]),
    PdfModule,
    XmlModule,
    EmailModule,
    OrderModule,
    FtpExportModule,
  ],
  controllers: [ImportedOrderController],
  providers: [ImportedOrderService, ImportXmlService],
  exports: [ImportedOrderService],
})
export class ImportedOrderModule {}
