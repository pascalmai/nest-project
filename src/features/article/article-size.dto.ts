import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDate,
} from 'class-validator';

export class ArticleSizeDto {
  @Expose()
  @IsUUID()
  @IsOptional()
  id: string;

  @Expose()
  @IsString()
  ean: string;

  @Expose()
  @IsDate()
  @IsOptional()
  availableFrom: Date;

  @Expose()
  @IsDate()
  @IsOptional()
  availableTo: Date;

  @Expose()
  @IsNumber()
  weightInKg: number;

  @Expose()
  @IsNumber()
  volumneInLiter: number;
}

export class UpdateArticleDto {
  @Expose()
  @IsString()
  ean: string;

  @Expose()
  @IsNumber()
  weightInKg: number;

  @Expose()
  @IsNumber()
  volumneInLiter: number;
}
