import type { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryMethod, type OrderPaymentMethod, type OrderStatus, Prisma } from '../../generated/prisma/client';
import type { CartItemResponseDto } from '../cart/dto/cart-Item-response.dto';
import type { CreateDeliveryInput } from '../delivery/delivery.contracts';
import type { OrderEntity, OrderItemEntity } from './entities/order.entity';
import type { OrderResponseDto } from './dto/order-response.dto';
import type { DeliveryResponseDto } from '../delivery/dto/delivery-response.dto';
import { PaymentResponseDto } from '../payment/dto/payment-response.dto';
import type { OrderItemResponseDto } from './dto/order-item-response.dto';
import type { ProductBaseResponseDto } from '../product/dto/product-base-response.dto';
import { ProductMapper } from '../product/product.mapper';
import { DeliveryMapper } from '../delivery/delivery.mapper';
import { PaymentMapper } from '../payment/payment.mapper';
import type { CheckoutResponseDto } from './dto/checkout-response.dto';


export class OrderMapper {
  static toPrismaOrderItemCreateInput(cartItem: CartItemResponseDto): Prisma.OrderItemCreateWithoutOrderInput {
    const data: Prisma.OrderItemCreateWithoutOrderInput = {
      quantity: cartItem.quantity,
      price: cartItem.product.price * cartItem.quantity,
      product: {
        connect: {id: cartItem.productId}
      }
    }

    return data;
  }

  static toPrismaDeliveryCreateInput(dto: CreateOrderDto): Prisma.DeliveryCreateWithoutOrderInput {
    const data: Prisma.DeliveryCreateWithoutOrderInput = {
      method: dto.delivery.method,
      recipientFullname: dto.delivery.recipientFullname,
      recipientPhone: dto.delivery.recipientPhone,
      cityName: dto.delivery.cityName,
      cityRef: dto.delivery.cityRef,
      warehouseName: dto.delivery.warehouseName,
      warehouseRef: dto.delivery.warehouseRef
    }

    return data;
  }

  static toPrismaOrderCreateInput(
    userId: string,
    amount: number,
    paymentMethod: OrderPaymentMethod,
    items: Prisma.OrderItemCreateWithoutOrderInput[],
    delivery: Prisma.DeliveryCreateWithoutOrderInput
  ): Prisma.OrderCreateInput {
    const data: Prisma.OrderCreateInput = {
      amount,
      paymentMethod,
      status: paymentMethod === "CASH" ? "PROCESSING" : "PENDING",
      user: {
        connect: {id: userId}
      },
      items: {
        create: items
      },
      delivery: {
        create: delivery
      }
    }

    return data;
  }

  static toOrderItemResponseDto(item: OrderItemEntity): OrderItemResponseDto {
    const responseDto: OrderItemResponseDto = {
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      orderId: item.orderId,
      productId: item.productId,
      product: ProductMapper.toBaseResponseDto(item.product)
    }

    return responseDto;
  }

  static toOrderResponseDto(order: OrderEntity): OrderResponseDto {
    const responseDto: OrderResponseDto = {
      id: order.id,
      amount: Number(order.amount),
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      userId: order.userId,
      items: order.items.map(item => OrderMapper.toOrderItemResponseDto(item)),
      //Вказуємо, що поле order.delivery точно не містить null, оскільки ми точно знаємо, що delivery створюється разом з order
      delivery: DeliveryMapper.toResponseDto(order.delivery!),
      payments: order.payments.map(payment => PaymentMapper.toResponseDto(payment))
    }

    return responseDto;
  }

  static toCheckoutResponseDto(order: OrderEntity, paymentUrl: string | null): CheckoutResponseDto {
    const responseDto: CheckoutResponseDto = {
      order: OrderMapper.toOrderResponseDto(order),
      paymentUrl
    }

    return responseDto;
  }
}