import  { DeliveryMethod, OrderPaymentMethod } from '../../../generated/prisma/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';


class DeliveryDto {
  @IsEnum(DeliveryMethod)
  readonly method: DeliveryMethod;

  @IsString({ message: "Поле 'recipientFullname' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'recipientFullname' не може бути порожнім" })
  readonly recipientFullname: string;

  @IsString({ message: "Поле 'recipientPhone' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'recipientPhone' не може бути порожнім" })
  readonly recipientPhone: string;

  @IsString({ message: "Поле 'cityName' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'cityName' не може бути порожнім" })
  readonly cityName: string;

  @IsUUID('all', { message: "Поле 'cityRef' має відповідати формату UUID" })
  readonly cityRef: string;

  @IsString({ message: "Поле 'warehouseName' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'warehouseName' не може бути порожнім" })
  readonly warehouseName: string;

  @IsUUID('all', { message: "Поле 'warehouseRef' має відповідати формату UUID" })
  readonly warehouseRef: string;
}

export class CreateOrderDto {
  @IsEnum(OrderPaymentMethod)
  readonly paymentMethod: OrderPaymentMethod;

  @ValidateNested()
  @Type(() => DeliveryDto)
  readonly delivery: DeliveryDto;
}
