import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';
import { IUser } from '../../shared/interfaces/user';

export class CreateUserDto {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  password: string;
}

export class ResponseUserDto implements IUser {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsBoolean()
  isAdmin: boolean;

  @Expose()
  @IsUUID()
  sportclubId: string;
}

export class RequestUserDto implements IUser {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsBoolean()
  isAdmin: boolean;

  @Expose()
  @IsUUID()
  sportclubId: string;
}
