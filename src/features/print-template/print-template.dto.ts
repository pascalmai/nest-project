import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

export class FindArticleSlotsDto {
  @Expose()
  @IsUUID()
  articleId: string;
}

export class PrintTemplateImageSlot {
  @Expose()
  @IsString()
  imageName: string;

  @Expose()
  @IsString()
  imageSlot: string;

  @Expose()
  @IsString()
  font: string;
}

export class CreatePrintTemplateDto {
  @Expose()
  @IsUUID()
  collectionId: string;

  @Expose()
  @IsUUID()
  articleId: string;

  @Expose()
  @Type(() => PrintTemplateImageSlot)
  @IsArray()
  @ValidateNested()
  items: PrintTemplateImageSlot[];
}

export class GetCollectionTemplateQueryDto {
  @Expose()
  @IsUUID()
  collectionId: string;

  @Expose()
  @IsUUID()
  articleId: string;
}
