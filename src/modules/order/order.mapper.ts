import type { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryMethod, type OrderPaymentMethod, type OrderStatus, Prisma } from '../../generated/prisma/client';
import type { CartItemResponseDto } from '../cart/dto/cart-Item-response.dto';
import { OrderEntity, OrderItemEntity } from './entities/order.entity';
import {
  OrderItemResponseDto,
  type OrderResponseDto,
} from './dto/order-response.dto';
import type { DeliveryResponseDto } from '../delivery/dto/delivery-response.dto';
import { PaymentResponseDto } from '../payment/dto/payment-response.dto';
//import type { OrderItemResponseDto } from './dto/order-item-response.dto';
import type { ProductBaseResponseDto } from '../product/dto/product-base-response.dto';
import { ProductMapper } from '../product/product.mapper';
import { DeliveryMapper } from '../delivery/delivery.mapper';
import { PaymentMapper } from '../payment/payment.mapper';
import type { CheckoutResponseDto } from './dto/checkout-response.dto';
import type { CartResponseDto } from '../cart/dto/cart-response.dto';
import type { SetTrackingNumberDto } from '../delivery/dto/set-tracking-number.dto';
import type { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import type { OrdersQueryDto } from './dto/orders-query.dto';



export class OrderMapper {
  private static toPrismaOrderItemCreateInput(
    cartItem: CartItemResponseDto,
  ): Prisma.OrderItemCreateWithoutOrderInput {
    const data: Prisma.OrderItemCreateWithoutOrderInput = {
      quantity: cartItem.quantity,
      price: cartItem.product.price * cartItem.quantity,
      product: {
        connect: { id: cartItem.productId },
      },
    };

    return data;
  }

  static toPrismaOrderCreateInput(
    userId: string,
    cart: CartResponseDto,
    dto: CreateOrderDto,
  ): Prisma.OrderCreateInput {
    //Створюємо OrderItemCreateWithoutOrderInput[]
    const items = cart.items.map((item) =>
      OrderMapper.toPrismaOrderItemCreateInput(item),
    );

    //Підраховуємо загальну суму замовлення
    const amount = items.reduce((acc, item) => {
      return acc + Number(item.price);
    }, 0);

    const data: Prisma.OrderCreateInput = {
      amount,
      paymentMethod: dto.paymentMethod,
      user: {
        connect: { id: userId },
      },
      items: {
        create: items,
      },
    };

    return data;
  }

  static toPrismaOrderWhereInput(
    filters: Omit<OrdersQueryDto, "pageNo" | "pageSize" | "sortOrder" | "sortBy">,
    userId?: string
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {
      userId, //Якщо userId не undefined, то здійснюється пошук замовлень користувача, якщо - ні, то - пошук усіх замовлень
      status: filters.statuses?.length
        ? {in: filters.statuses}
        : undefined,
      paymentMethod: filters.paymentMethods?.length
        ? {in: filters.paymentMethods}
        : undefined
    }

    return where;
  }

  //Маппінг до SetTrackingNumberDto. Створюється в модулі order, оскільки OrderService виступає оркестратором для генерації ТТН
  static toSetTrackingNumberDto(order: OrderEntity): SetTrackingNumberDto {
    const widthMm = order.items.reduce((acc, item) => {
      return acc < item.product.widthMm ? item.product.widthMm : acc
    }, 0);

    const heightMm = order.items.reduce((acc, item) => {
      return acc < item.product.heightMm ? item.product.heightMm : acc;
    }, 0);

    const depthMm = order.items.reduce((acc, item) => {
      return acc + item.product.depthMm;
    }, 0);

    const weightGrams = order.items.reduce((acc, item) => {
      return acc + item.product.weightGrams * item.product.quantity;
    }, 0);

    const dto: SetTrackingNumberDto = {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      amount: Number(order.amount),
      recipientFirstname: order.delivery!.recipientFirstname,
      recipientLastname: order.delivery!.recipientLastname,
      recipientPhone: order.delivery!.recipientPhone,
      cityName: order.delivery!.cityName,
      cityRef: order.delivery!.cityRef,
      warehouseName: order.delivery!.warehouseName,
      warehouseRef: order.delivery!.warehouseRef,
      widthMm,
      heightMm,
      depthMm,
      weightGrams,
    };

    return dto;
  }

  private static toOrderItemResponseDto(item: OrderItemEntity): OrderItemResponseDto {
    const responseDto: OrderItemResponseDto = {
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      orderId: item.orderId,
      productId: item.productId,
      product: ProductMapper.toBaseResponseDto(item.product),
    };

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
      items: order.items.map((item) =>
        OrderMapper.toOrderItemResponseDto(item),
      ),
      //Вказуємо, що поле order.delivery точно не містить null, оскільки ми точно знаємо, що delivery створюється разом з order
      delivery: DeliveryMapper.toResponseDto(order.delivery!),
      payments: order.payments.map((payment) =>
        PaymentMapper.toResponseDto(payment),
      ),
    };

    return responseDto;
  }

  static toCheckoutResponseDto(order: OrderEntity, paymentUrl: string | null): CheckoutResponseDto {
    const responseDto: CheckoutResponseDto = {
      order: OrderMapper.toOrderResponseDto(order),
      paymentUrl,
    };

    return responseDto;
  }
}