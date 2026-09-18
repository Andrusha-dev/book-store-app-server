import { type DeliveryMethod, type OrderPaymentMethod, Prisma } from '../../generated/prisma/client';
import type { DeliveryEntity } from './entities/delivery.entity';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { SetTrackingNumberDto } from './dto/set-tracking-number.dto';
import type { ICreateTrackingRequest } from './infrastructure/nova-poshta.provider';


export class DeliveryMapper {
  static toDeliveryCreateWithoutOrderInput(dto: CreateDeliveryDto): Prisma.DeliveryCreateWithoutOrderInput {
    const data: Prisma.DeliveryCreateWithoutOrderInput = {
      method: dto.method,
      recipientFirstname: dto.recipientFirstname,
      recipientLastname: dto.recipientLastname,
      recipientPhone: dto.recipientPhone,
      cityName: dto.cityName,
      cityRef: dto.cityRef,
      warehouseName: dto.warehouseName,
      warehouseRef: dto.warehouseRef
    }

    return data;
  }

  static toICreateTrackingRequest(dto: SetTrackingNumberDto): ICreateTrackingRequest{
    const request: ICreateTrackingRequest = {
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
      recipientFirstname: dto.recipientFirstname,
      recipientLastname: dto.recipientLastname,
      recipientPhone: dto.recipientPhone,
      cityName: dto.cityName,
      cityRef: dto.cityRef,
      warehouseName: dto.warehouseName,
      warehouseRef: dto.warehouseRef,
      volumeM3: dto.volumeMm3 / 100000000,
      weightKGrams: dto.weightGrams / 1000
    }

    return request;
  }

  static toResponseDto(delivery: DeliveryEntity): DeliveryResponseDto {
    const responseDto: DeliveryResponseDto = {
      id: delivery.id,
      method: delivery.method,
      recipientFirstname: delivery.recipientFirstname,
      recipientLastname: delivery.recipientLastname,
      recipientPhone: delivery.recipientPhone,
      cityName: delivery.cityName,
      cityRef: delivery.cityRef,
      warehouseName: delivery.warehouseName,
      warehouseRef: delivery.warehouseRef,
      trackingNumber: delivery.trackingNumber ?? undefined,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
      orderId: delivery.orderId
    }

    return responseDto;
  }
}