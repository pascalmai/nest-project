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
import { map, Observable } from 'rxjs';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { OrderService } from './order.service';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { IsUserGuard } from '../auth/guards/is-user.guard';
import { OrdersResponse } from '../../shared/interfaces';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';
import { Response } from 'express';
import { OkResponseDto, SendEmailDto } from '../../shared/dto';
import { RequestUser } from '../../shared/decorators';
import { RequestUserDto } from '../user/user.dto';
import { plainToClass } from 'class-transformer';

@UseGuards(AuthJwtGuard)
@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(IsUserGuard)
  findAll(
    @RequestUser() { sportclubId }: RequestUserDto,
    @Query('teamId') teamId?: string,
  ): Observable<OrdersResponse[]> {
    return this.orderService.findAll(sportclubId, teamId);
  }

  @Get('lookup')
  @UseGuards(IsUserGuard)
  lookup(
    @Query('collectionId') collectionId?: string,
  ): Observable<{ orders: OrdersResponse[]; articleIds: string[] }> {
    return this.orderService.lookup(collectionId);
  }

  @Get(':id')
  @UseGuards(IsAdminGuard)
  findOne(@Param('id') id: string): Observable<OrderEntity> {
    return this.orderService.findOneWithDetails(id);
  }

  @Get(':id/export-pdf')
  exportPdf(@Param('id') id: string, @Res() res: Response): any {
    return this.orderService.exportPdf(id).pipe(
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
    return this.orderService.deliveryNote(id).pipe(
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
    return this.orderService.getPrintSheet(id).pipe(
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
    return this.orderService.sendInvoiceEmail(id, payload);
  }

  @Post()
  @UseGuards(IsUserGuard)
  create(
    @RequestUser() { sportclubId }: RequestUserDto,
    @Body() payload: CreateOrderDto,
  ): Observable<OkResponseDto> {
    const orderDto = plainToClass(CreateOrderDto, { ...payload, sportclubId });
    this.logger.log(`create order payload ${JSON.stringify(orderDto)}`);

    return this.orderService.create(orderDto);
  }

  @Patch(':id')
  @UseGuards(IsAdminGuard)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateOrderDto,
  ): Observable<any> {
    return this.orderService.update(id, payload);
  }
}
