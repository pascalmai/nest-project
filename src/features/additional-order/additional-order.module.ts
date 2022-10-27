import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalOrderRepository } from './additional-order-line.repository';
import { AdditionalOrderController } from './additional-order.controller';
import { AdditionalOrderService } from './additional-order.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalOrderRepository])],
  controllers: [AdditionalOrderController],
  providers: [AdditionalOrderService],
})
export class AdditionalOrderModule {}
