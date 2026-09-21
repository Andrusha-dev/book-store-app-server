import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
  OrderPaymentMethod,
  OrderStatus,
} from '../../../generated/prisma/enums';
import { Transform } from 'class-transformer';


export enum OrderSortBy {
  CREATED_AT = 'createdAt',
  STATUS = 'status',
  AMOUNT = 'amount'
}

export class OrdersQueryDto extends PageQueryDto {
  @IsEnum(OrderSortBy)
  readonly sortBy: OrderSortBy = OrderSortBy.CREATED_AT;

  //Повертає масив, якщо дані фільтра вже є масивом, або створю масив, якщо фільтр має єдине значення
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as unknown[])
  @IsArray({ message: 'Поле "statuses" має бути масивом' })
  @IsEnum(OrderStatus, { each: true, message: 'Перелік значень "statuses" не відповідає допустимим значенням'})
  @IsOptional()
  readonly statuses?: OrderStatus[];

  //Повертає масив, якщо дані фільтра вже є масивом, або створю масив, якщо фільтр має єдине значення
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as unknown[])
  @IsArray({ message: 'Поле "paymentMethods" має бути масивом' })
  @IsEnum(OrderPaymentMethod, { each: true, message: 'Перелік значень "paymentsMethods" не відповідає допустимим значенням'})
  @IsOptional()
  readonly paymentMethods?: OrderPaymentMethod[];
}