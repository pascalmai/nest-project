import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { AdditionalOrderService } from './additional-order.service';
import { AdditionalOrderDto } from './additional-order.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';

@UseGuards(AuthJwtGuard, IsAdminGuard)
@Controller('additional-order')
export class AdditionalOrderController {
  private readonly logger = new Logger(AdditionalOrderController.name);

  constructor(
    private readonly additionalOrderService: AdditionalOrderService,
  ) {}

  @Get()
  async getAll(): Promise<AdditionalOrderDto[]> {
    const orders = await firstValueFrom(this.additionalOrderService.getAll());
    this.logger.log(`additional orders: ${JSON.stringify(orders)}`);

    return orders;
  }

  @Get('imported/:id')
  async getImportedOrderAdditionalOrders(@Param('id') id: string) {
    const orders = await firstValueFrom(
      this.additionalOrderService.getImportedOrderAdditionalOrdersById(id),
    );

    this.logger.log(
      `imported order additional orders: ${JSON.stringify(orders)}`,
    );

    return orders;
  }

  @Get(':id')
  async getOrderAdditionalOrders(@Param('id') id: string) {
    const orders = await firstValueFrom(
      this.additionalOrderService.getOrderAdditionalOrdersById(id),
    );

    this.logger.log(
      `regular order additional orders: ${JSON.stringify(orders)}`,
    );

    return orders;
  }

  @Post()
  create(
    @Body() orders: AdditionalOrderDto[],
  ): Observable<AdditionalOrderDto[]> {
    this.logger.log(`create additional orders: ${JSON.stringify(orders)}`);

    return this.additionalOrderService.createOrders(orders);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`delete additional order: ${id}`);

    return this.additionalOrderService.delete(id);
  }
}
