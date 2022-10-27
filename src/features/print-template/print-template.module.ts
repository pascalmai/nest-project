import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { PrintTemplateController } from './print-template.controller';
import { PrintTemplateService } from './print-template.service';
import { ArticleTemplateSlotRepository } from './repositories/article-template-slot.repository';
import { PrintTemplateRepository } from './repositories/print-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrintTemplateRepository,
      ArticleTemplateSlotRepository,
    ]),
    FileUploadModule,
  ],
  controllers: [PrintTemplateController],
  providers: [PrintTemplateService],
  exports: [PrintTemplateService],
})
export class PrintTemplateModule {}
