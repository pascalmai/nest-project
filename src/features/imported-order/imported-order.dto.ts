import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';
import { AC_ORDER_STATUS } from '../../shared/enums';
import { UpdateAddressDto } from '../sportclub/customer.dto';

export class UpdateImportedOrderDto {
  @Expose()
  @IsEnum(AC_ORDER_STATUS)
  @IsOptional()
  status?: AC_ORDER_STATUS;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isDownloaded: boolean;

  @Expose()
  @IsObject()
  @IsOptional()
  shippingAddress?: UpdateAddressDto;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isReadyForExport: boolean;
}
