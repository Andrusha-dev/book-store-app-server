import  { DeliveryMethod, OrderPaymentMethod } from '../../../generated/prisma/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryDto } from '../../delivery/dto/create-delivery.dto';


export class CreateOrderDto {
  @IsEnum(OrderPaymentMethod)
  readonly paymentMethod: OrderPaymentMethod;

  @ValidateNested()
  @Type(() => CreateDeliveryDto)
  readonly delivery: CreateDeliveryDto;
}
