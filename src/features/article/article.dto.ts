import { Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { CATEGORY_IDENT } from '../../shared/enums';
export class ArticleWithIdentResponseDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  categoryIdent: string;
}

export class GetArticlesDto {
  @Expose()
  @IsEnum(CATEGORY_IDENT)
  @IsOptional()
  category: CATEGORY_IDENT;
}

export class UpdateArticleDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  jakoColorCode: string;

  @Expose()
  @IsString()
  jakoColorDescription: string;

  @Expose()
  @IsString()
  articleType: string;
}
