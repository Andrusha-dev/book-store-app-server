import type { CreateDeliveryInput } from './delivery.contracts';
import { type DeliveryMethod, Prisma } from '../../generated/prisma/client';
import type { DeliveryEntity } from './entities/delivery.entity';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';


export class DeliveryMapper {
  static toResponseDto(delivery: DeliveryEntity): DeliveryResponseDto {
    const responseDto: DeliveryResponseDto = {
      id: delivery.id,
      method: delivery.method,
      recipientFullname: delivery.recipientFullname,
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