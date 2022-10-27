import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ImportDataService } from './import-data.service';
import { ImportXmlService } from '../xml/import-xml.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ArticleUploadHelper } from 'src/shared/helpers';
import { OkResponseDto } from 'src/shared/dto';
import { ImportOrderResponse } from 'src/shared/interfaces';

@Controller('import-data')
export class ImportDataController {
  constructor(
    private readonly importDataService: ImportDataService,
    private readonly importXmlService: ImportXmlService,
  ) {}

  @Get('default')
  importDefaultData() {
    return this.importDataService.runSaveArticleCatalog(
      '20210617_JAKO_Artikelliste_komplett.xlsx',
    );
  }

  @Post('import-articles')
  @UseInterceptors(
    FilesInterceptor('articleFiles', 10, {
      storage: diskStorage({
        destination: ArticleUploadHelper.destinationPath,
        filename: ArticleUploadHelper.customFileName,
      }),
      fileFilter: ArticleUploadHelper.filterFile,
    }),
  )
  async importArticles(
    @UploadedFiles() articleFiles: Array<Express.Multer.File>,
  ): Promise<OkResponseDto> {
    try {
      for (let i = 0; i < articleFiles.length; i++) {
        await this.importDataService.runSaveArticleCatalog(
          articleFiles[i].filename,
        );
      }
    } catch (error) {
      throw new Error(error);
    }
    return { ok: true };
  }

  @Get('xml-order')
  importXmlOrders(): Promise<ImportOrderResponse> {
    return this.importXmlService.processFiles();
  }
}
