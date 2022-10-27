import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class OkResponseDto {
  @Expose()
  @IsBoolean()
  ok: boolean;
}

export class SendEmailDto {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @Expose()
  @IsString()
  emailContent: string;
}
