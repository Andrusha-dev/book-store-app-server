import { Prisma } from '../../generated/prisma/client';
import type { DeliveryEntity } from './entities/delivery.entity';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { CreateTrackingNumberDto } from './dto/create-tracking-number.dto';
import type {
  CreateTrackingRequest,
  TrackingStatusItem,
} from './infrastructure/nova-poshta.provider';
import type { TrackingStatusItemResponseDto } from './dto/tracking-status-item-response.dto';


export class DeliveryMapper {
  static toDeliveryCreateInput(orderId: string, dto: CreateDeliveryDto): Prisma.DeliveryCreateInput {
    const data: Prisma.DeliveryCreateInput = {
      method: dto.method,
      recipientFirstname: dto.recipientFirstname,
      recipientLastname: dto.recipientLastname,
      recipientPhone: dto.recipientPhone,
      cityName: dto.cityName,
      cityRef: dto.cityRef,
      warehouseName: dto.warehouseName,
      warehouseRef: dto.warehouseRef,
      order: {
        connect: {id: orderId}
      }
    }

    return data;
  }

  static toCreateTrackingRequest(dto: CreateTrackingNumberDto): CreateTrackingRequest{
    const request: CreateTrackingRequest = {
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
      recipientFirstname: dto.recipientFirstname,
      recipientLastname: dto.recipientLastname,
      recipientPhone: dto.recipientPhone,
      cityName: dto.cityName,
      cityRef: dto.cityRef,
      warehouseName: dto.warehouseName,
      warehouseRef: dto.warehouseRef,
      widthSm: dto.widthMm / 10,
      heightSm: dto.heightMm /10,
      depthSm: dto.depthMm / 10,
      volumeM3: (dto.widthMm * dto.heightMm * dto.depthMm) / 10000000,
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
  //Маппінг до обєкта, що містить номер ТТН та статус цієї ттн (який визначений новою поштою)
  static toTrackingStatusItemResponseDto(item: TrackingStatusItem): TrackingStatusItemResponseDto {
    const responseDto: TrackingStatusItemResponseDto = {
      trackingNumber: item.Number,
      statusValue: item.StatusCode
    }

    return responseDto;
  }
}