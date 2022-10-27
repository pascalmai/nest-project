import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintTemplateModule } from '../print-template/print-template.module';
import { TeamModule } from '../team/team.module';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionArticleRepository } from './repositories/collection-article.repository';
import { CollectionRepository } from './repositories/collection.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionRepository,
      CollectionArticleRepository,
    ]),
    TeamModule,
    PrintTemplateModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
