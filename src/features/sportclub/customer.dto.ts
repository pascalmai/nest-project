import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetCustomersDto {
  @Expose()
  @IsBooleanString()
  isDeleted: string;
}

export class AddressDto {
  @Expose()
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @Expose()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Expose()
  @IsString()
  street: string;

  @Expose()
  @IsString()
  houseNumber: string;

  @Expose()
  @IsString()
  postalCode: string;

  @Expose()
  @IsString()
  city: string;
}

export class UpdateAddressDto {
  @Expose()
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @Expose()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Expose()
  @IsString()
  @IsOptional()
  street?: string;

  @Expose()
  @IsString()
  @IsOptional()
  houseNumber?: string;

  @Expose()
  @IsString()
  @IsOptional()
  postalCode?: string;

  @Expose()
  @IsString()
  @IsOptional()
  city?: string;
}

export class CreateCustomerDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  fullName?: string;

  @Expose()
  @IsString()
  jakoCustomerNumber: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  discount?: number;

  @Expose()
  @Type(() => AddressDto)
  @ValidateNested()
  invoiceAddress: AddressDto;

  @Expose()
  @Type(() => AddressDto)
  @ValidateNested()
  shippingAddress: AddressDto;
}

export class UpdateCustomerDto {
  @Expose()
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  jakoCustomerNumber?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  discount?: number;

  @Expose()
  @Type(() => UpdateAddressDto)
  @ValidateNested()
  @IsOptional()
  invoiceAddress?: UpdateAddressDto;

  @Expose()
  @Type(() => UpdateAddressDto)
  @ValidateNested()
  @IsOptional()
  shippingAddress?: UpdateAddressDto;

  @Expose()
  @IsArray()
  @IsOptional()
  contacts?: any[];
}

export class ContactDto {
  @IsOptional()
  fullName?: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  photo: string;
}
