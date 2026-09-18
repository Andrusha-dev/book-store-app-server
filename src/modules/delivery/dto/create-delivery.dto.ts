import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { DeliveryMethod } from '../../../generated/prisma/enums';


export class CreateDeliveryDto {
  @IsEnum(DeliveryMethod)
  readonly method: DeliveryMethod;

  @IsString({ message: "Поле 'recipientFirstname' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'recipientFirstname' не може бути порожнім" })
  readonly recipientFirstname: string;

  @IsString({ message: "Поле 'recipientLastname' має бути рядком" })
  @IsNotEmpty({ message: "Поле 'recipientLastname' не може бути порожнім" })
  readonly recipientLastname: string;

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