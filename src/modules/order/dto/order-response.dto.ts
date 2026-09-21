import type {
  OrderPaymentMethod,
  OrderStatus,
} from '../../../generated/prisma/enums';
import type { ProductBaseResponseDto } from '../../product/dto/product-base-response.dto';
import type { DeliveryResponseDto } from '../../delivery/dto/delivery-response.dto';
import type { PaymentResponseDto } from '../../payment/dto/payment-response.dto';

export class OrderItemResponseDto {
  readonly id: string;
  readonly quantity: number;
  readonly price: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly orderId: string;
  readonly productId: string;
  readonly product: ProductBaseResponseDto;
}

export class OrderResponseDto {
  readonly id: string;
  readonly amount: number;
  readonly status: OrderStatus;
  readonly paymentMethod: OrderPaymentMethod;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: string;
  readonly items: OrderItemResponseDto[];
  readonly delivery: DeliveryResponseDto;
  readonly payments: PaymentResponseDto[];
}