import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleGenderRepository } from './repositories/article-gender.repository';
import { ArticleSizeRepository } from './repositories/article-size.repository';
import { ArticleRepository } from './repositories/article.repository';
import { ArticleSizeController } from './article-size.controller';
import { ArticleSizeService } from './article-size.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleRepository,
      ArticleGenderRepository,
      ArticleSizeRepository,
    ]),
  ],
  controllers: [ArticleController, ArticleSizeController],
  providers: [ArticleService, ArticleSizeService],
})
export class ArticleModule {}
