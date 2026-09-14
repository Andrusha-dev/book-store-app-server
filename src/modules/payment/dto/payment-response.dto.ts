import type { PaymentStatus } from '../../../generated/prisma/enums';


export class PaymentResponseDto {
  readonly id: string;
  readonly status: PaymentStatus;
  readonly externalId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly orderId: string;
}