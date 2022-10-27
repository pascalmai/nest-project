import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @Expose()
  @IsString()
  accessToken: string;
}
