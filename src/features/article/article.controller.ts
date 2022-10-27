import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ArticleWithIdentResponseDto,
  GetArticlesDto,
  UpdateArticleDto,
} from './article.dto';
import { ArticleService } from './article.service';
import { ArticleEntity } from './entities/article.entity';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';

@UseGuards(AuthJwtGuard)
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findMany(@Query() params: GetArticlesDto): Observable<ArticleEntity[]> {
    return this.articleService.findMany(params);
  }

  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  lookupArticles(@Body() payload: string[]): Observable<ArticleEntity[]> {
    return this.articleService.lookupArticles(payload);
  }

  @Post('color-code')
  @HttpCode(HttpStatus.OK)
  findColorCodes(@Body() payload: string[]) {
    return this.articleService.findColorCodes(payload);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ArticleWithIdentResponseDto> {
    return this.articleService.findOne({ id });
  }

  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() payload: UpdateArticleDto,
  ): Observable<ArticleEntity> {
    return this.articleService.updateOne(id, payload);
  }
}
