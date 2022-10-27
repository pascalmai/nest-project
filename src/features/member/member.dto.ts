import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MemberSizeDto {
  @Expose()
  @IsString()
  top: string;

  @Expose()
  @IsString()
  bottom: string;

  @Expose()
  @IsString()
  tracksuit: string;

  @Expose()
  @IsString()
  shoe: string;
}

export class CreateMemberDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  gender: string;

  @Expose()
  @IsDateString()
  dob: Date;

  @Expose()
  @IsNumber()
  height: number;

  @Expose()
  @IsNumber()
  jerseyNumber: number;

  @Expose()
  @IsString()
  jerseyText: string;

  @Expose()
  @IsArray()
  selectedTeamIds: string[];

  @Expose()
  @Type(() => MemberSizeDto)
  @ValidateNested()
  sizes: MemberSizeDto;
}

export class UpdateMemberDto {
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  gender?: string;

  @Expose()
  @IsDateString()
  @IsOptional()
  dob?: Date;

  @Expose()
  @IsNumber()
  @IsOptional()
  height?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  jerseyNumber?: number;

  @Expose()
  @IsString()
  @IsOptional()
  jerseyText?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  selectedTeamIds?: string[];

  @Expose()
  @IsOptional()
  @Type(() => MemberSizeDto)
  @ValidateNested()
  sizes?: MemberSizeDto;
}

export class ResponseMemberDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  gender: string;

  @Expose()
  @IsDateString()
  dob: Date;

  @Expose()
  @IsNumber()
  height: number;

  @Expose()
  @IsNumber()
  jerseyNumber: number;

  @Expose()
  @IsString()
  jerseyText: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsArray()
  memberTeams: any[];

  @Expose()
  @IsOptional()
  @Type(() => MemberSizeDto)
  @ValidateNested()
  sizes: MemberSizeDto;
}

export class ResponseMemberLightDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;
}
