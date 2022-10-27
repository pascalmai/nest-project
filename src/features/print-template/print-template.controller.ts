import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { ArticleTemplateSlotEntity } from './entities/article-template-slot.entity';
import { PrintTemplateEntity } from './entities/print-template.entity';
import {
  FindArticleSlotsDto,
  GetCollectionTemplateQueryDto,
} from './print-template.dto';
import { PrintTemplateService } from './print-template.service';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { CreatePrintTemplateDto } from './create-print-template.dto';

@UseGuards(AuthJwtGuard)
@Controller('print-template')
export class PrintTemplateController {
  private readonly logger = new Logger(PrintTemplateService.name);

  constructor(private readonly printTemplateService: PrintTemplateService) {}

  @Get('collection')
  findCollectionTemplates(
    @Query() payload: GetCollectionTemplateQueryDto,
  ): Observable<PrintTemplateEntity[]> {
    this.logger.log(`collection payload: ${JSON.stringify(payload)}`);

    return this.printTemplateService.findCollectionTemplates(payload);
  }

  @Get('available-slot')
  findAvailableSlots(
    @Query() { articleId }: FindArticleSlotsDto,
  ): Observable<ArticleTemplateSlotEntity[]> {
    this.logger.log(`available slots article id: ${articleId}`);

    return this.printTemplateService.findArticleSlots(articleId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  create(
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() payload: CreatePrintTemplateDto,
  ): Observable<PrintTemplateEntity[]> {
    this.logger.log(`create payload: ${JSON.stringify(payload)}`);
    this.logger.log(`create uploaded files(images): ${JSON.stringify(images)}`);

    return this.printTemplateService.create(images, payload);
  }
}
