import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ImportedOrderService } from './imported-order.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ImportedOrderResponse } from '../../shared/interfaces';
import { ImportedOrderEntity } from './entities/imported-order.entity';
import { UpdateImportedOrderDto } from './imported-order.dto';
import { Response } from 'express';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';
import { OkResponseDto, SendEmailDto } from '../../shared/dto';

@UseGuards(AuthJwtGuard, IsAdminGuard)
@Controller('imported-order')
export class ImportedOrderController {
  private readonly logger = new Logger(ImportedOrderController.name);

  constructor(private readonly importedOrderService: ImportedOrderService) {}

  @Get()
  async findMany(
    @Query('haveImages') haveImages: string,
  ): Promise<ImportedOrderResponse[]> {
    const result = await firstValueFrom(
      this.importedOrderService.findMany(haveImages),
    );
    this.logger.log(`get many imported orders ${JSON.stringify(result)}`);

    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ImportedOrderEntity> {
    return this.importedOrderService.findOne({ id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateImportedOrderDto,
  ): Observable<ImportedOrderEntity> {
    return this.importedOrderService.update(id, payload);
  }

  @Get(':id/export-pdf')
  exportPdf(@Param('id') id: string, @Res() res: Response): any {
    return this.importedOrderService.exportPdf(id).pipe(
      map((result) => {
        res.header('Content-disposition', 'attachment; filename=invoice.pdf');
        res.type('application/pdf');

        result.pipe(res);
        result.end();
      }),
    );
  }

  @Get(':id/delivery-note')
  exportDliveryNote(@Param('id') id: string, @Res() res: Response): any {
    return this.importedOrderService.deliveryNote(id).pipe(
      map((result) => {
        res.header(
          'Content-disposition',
          'attachment; filename=delivery-note.pdf',
        );
        res.type('application/pdf');

        result.pipe(res);
        result.end();
      }),
    );
  }

  @Get(':id/print-sheet')
  getPrintSheet(@Param('id') id: string, @Res() res: Response): any {
    return this.importedOrderService.getPrintSheet(id).pipe(
      map((result) => {
        res.header(
          'Content-disposition',
          'attachment; filename=print-sheet.pdf',
        );
        res.type('application/pdf');

        result.pipe(res);
        result.end();
      }),
    );
  }

  @Post(':id/send-email')
  sendInvoiceEmail(
    @Param('id') id: string,
    @Body() payload: SendEmailDto,
  ): Observable<OkResponseDto> {
    try {
      return this.importedOrderService.sendInvoiceEmail(id, payload);
    } catch (error) {
      throw new Error(error);
    }
  }
}
