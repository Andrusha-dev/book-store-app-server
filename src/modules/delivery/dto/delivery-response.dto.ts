import type { DeliveryMethod } from '../../../generated/prisma/enums';

export class DeliveryResponseDto {
  id: string;
  method: DeliveryMethod;
  recipientFirstname: string;
  recipientLastname: string;
  recipientPhone: string;
  cityName: string;
  cityRef: string;
  warehouseName: string;
  warehouseRef: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
}