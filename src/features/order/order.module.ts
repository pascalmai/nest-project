import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XmlModule } from '../xml/xml.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderLineRepository } from './repositories/order-line.repository';
import { OrderRepository } from './repositories/order.repository';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';
import { SportclubModule } from '../sportclub/sportclub.module';
import { SportclubRepository } from '../sportclub/repositories/sportclub.repository';
import { FtpExportModule } from '../ftp-export/ftp-export.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderRepository,
      OrderLineRepository,
      SportclubRepository,
    ]),
    XmlModule,
    PdfModule,
    EmailModule,
    SportclubModule,
    FtpExportModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
