import { DeliveryMethod } from '../../generated/prisma/enums';

//Вхідний контракт сервісу при створенні delivery
export class CreateDeliveryInput {
  readonly method: DeliveryMethod;
  readonly recipientFullname: string;
  readonly recipientPhone: string;
  readonly cityName: string;
  readonly cityRef: string;
  readonly warehouseName: string;
  readonly warehouseRef: string;
  readonly orderId: string;
}