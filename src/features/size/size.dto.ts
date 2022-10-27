import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export type SizeGender = 'male' | 'female';
export type IsChildrenSize = '1' | '0';

export class GetSizesQueryParamsDto {
  @Expose()
  @IsString()
  @IsOptional()
  gender?: SizeGender;

  @Expose()
  @IsString()
  children: IsChildrenSize;
}

export class SizeResponseDto {
  @IsString()
  jakoSizeId: string;
  @IsString()
  name: string;
}
