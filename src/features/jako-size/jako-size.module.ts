import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JakoSizeRepository } from './jako-size.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JakoSizeRepository])],
})
export class JakoSizeModule {}
