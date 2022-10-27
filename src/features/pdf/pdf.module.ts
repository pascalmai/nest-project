import { Module } from '@nestjs/common';
import { PdfService } from './pdf-service';
import { OrderPdfService } from './order-pdf.service';

@Module({
  providers: [PdfService, OrderPdfService],
  exports: [OrderPdfService],
})
export class PdfModule {}
