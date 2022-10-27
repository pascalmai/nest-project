import { Module } from '@nestjs/common';
import { ImportedOrderModule } from '../imported-order/imported-order.module';
import { OrderModule } from '../order/order.module';
import { XmlModule } from '../xml/xml.module';
import { CronCron } from './cron.cron';

@Module({
  imports: [OrderModule, ImportedOrderModule, XmlModule],
  providers: [CronCron],
})
export class CronModule {}
