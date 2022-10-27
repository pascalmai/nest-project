import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SizeController } from './size.controller';
import { SizeService } from './size.service';

@Module({
  imports: [TypeOrmModule.forFeature()],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
