import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ArticleSizeService } from './article-size.service';
import { ArticleSizeEntity } from './entities/article-size.entity';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { ArticleSizeDto, UpdateArticleDto } from './article-size.dto';

@UseGuards(AuthJwtGuard)
@Controller('article-size')
export class ArticleSizeController {
  constructor(private readonly articleSizeService: ArticleSizeService) {}

  @Get()
  findMany(): Observable<ArticleSizeEntity[]> {
    return this.articleSizeService.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ArticleSizeDto> {
    return this.articleSizeService.findOne({ id });
  }

  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() payload: UpdateArticleDto,
  ): Observable<ArticleSizeEntity> {
    return this.articleSizeService.update(id, payload);
  }
}
