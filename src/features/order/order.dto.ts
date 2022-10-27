import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AC_ORDER_STATUS } from '../../shared/enums';
import { CollectionEntity } from '../collection/entities/collection.entity';
import { OrderLineEntity } from './entities/order-line.entity';

export class OrderDto {
  collectionId: string;

  createdAt: Date;

  orderNumber: number;

  invoiceNumber: number;

  status: AC_ORDER_STATUS;

  isDownloaded: boolean;

  isExported: boolean;

  collection: CollectionEntity;

  orderLines: OrderLineEntity[];

  itemsCount?: number;

  totalPrice?: number;

  haveImages?: boolean;
}

export class CreateOrderLineDto {
  @Expose()
  @IsUUID()
  articleId: string;

  @Expose()
  @IsUUID()
  articleSizeId: string;

  @Expose()
  @IsUUID()
  memberId: string;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsString()
  printNumber: string;

  @Expose()
  @IsString()
  printText: string;
}

export class CreateOrderDto {
  @Expose()
  @IsUUID()
  collectionId: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  sportclubId: string;

  @Expose()
  @Type(() => CreateOrderLineDto)
  @IsArray()
  @ValidateNested()
  orderLines: CreateOrderLineDto[];
}

export class UpdateOrderDto {
  @Expose()
  @IsEnum(AC_ORDER_STATUS)
  @IsOptional()
  status?: AC_ORDER_STATUS;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isDownloaded: boolean;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isExported: boolean;
}
