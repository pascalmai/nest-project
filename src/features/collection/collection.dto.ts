import { Expose } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCollectionDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsUUID()
  teamId: string;

  @Expose()
  @IsBoolean()
  isStandard: boolean;

  @Expose()
  @IsArray()
  articleIds: string[];
}

export class UpdateCollectionDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsUUID()
  teamId: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isStandard?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  articleIds?: string[];
}
