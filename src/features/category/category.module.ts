import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { JakoCategoryRepository } from './repositories/jako-category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryRepository, JakoCategoryRepository]),
  ],
})
export class CategoryModule {}
