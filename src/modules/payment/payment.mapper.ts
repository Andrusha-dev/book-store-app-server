import { Prisma } from '../../generated/prisma/client';
import type { PaymentEntity } from './entities/payment.entity';
import type { PaymentResponseDto } from './dto/payment-response.dto';

export class PaymentMapper {
  static toPrismaCreateInput(orderId: string, externalId?: string): Prisma.PaymentCreateInput {
    const data: Prisma.PaymentCreateInput = {
      externalId,
      status: "PENDING",
      order: {
        connect: { id: orderId }
      }
    }

    return data;
  }

  static toResponseDto(payment: PaymentEntity): PaymentResponseDto {
    const responseDto: PaymentResponseDto = {
      id: payment.id,
      status: payment.status,
      externalId: payment.externalId ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      orderId: payment.orderId
    }

    return responseDto;
  }
}