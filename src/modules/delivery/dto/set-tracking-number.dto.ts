import type { OrderPaymentMethod } from '../../../generated/prisma/enums';


export class SetTrackingNumberDto {
  readonly orderId: string;
  readonly paymentMethod: OrderPaymentMethod;
  readonly amount: number;
  readonly recipientFirstname: string;
  readonly recipientLastname: string;
  readonly recipientPhone: string;
  readonly cityName: string;
  readonly cityRef: string;
  readonly warehouseName: string;
  readonly warehouseRef: string;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly depthMm: number;
  readonly weightGrams: number;
}