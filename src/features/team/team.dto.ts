import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsUUID()
  sportclubId: string;

  @Expose()
  @IsArray()
  selectedMemberIds: string[];
}

export class UpdateTeamDto {
  @Expose()
  @IsString()
  @IsOptional()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  description: string;

  @Expose()
  @IsOptional()
  @IsArray()
  selectedMemberIds?: string[];
}

export class ResponseTeamDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  standardCollectionId: string;
}
