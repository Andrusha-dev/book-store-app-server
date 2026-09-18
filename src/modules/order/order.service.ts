import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { OrderResponseDto } from './dto/order-response.dto';
import { Prisma } from '../../generated/prisma/client';
import type { OrderCreateInput } from '../../generated/prisma/models/Order';
import { OrderMapper } from './order.mapper';
import { CartService } from '../cart/cart.service';
import { DeliveryService } from '../delivery/delivery.service';
import {
  type OrderEntity,
  orderInclude,
} from './entities/order.entity';
import { ProductService } from '../product/product.service';
import { PaymentService } from '../payment/payment.service';
import type { InvoiceResponseDto } from '../payment/dto/invoice-response.dto';
import type { CheckoutResponseDto } from './dto/checkout-response.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly deliveryService: DeliveryService,
    private readonly paymentService: PaymentService,
    private readonly logger: Logger
  ) {}

  async checkout(userId: string, dto: CreateOrderDto): Promise<CheckoutResponseDto> {
    const createdOrder: OrderEntity = await this.prismaService.$transaction(async (tx) => {
      //Створюємо замовлення з доставкою
      const order: OrderEntity = await this.create(userId, dto, tx);

      //Списуємо товар
      for (const item of order.items) {
        await this.productService.decreaseQuantity(item.productId, item.quantity, tx);
      }

      return order;
    });

    //Очищуємо кошик. Не повинен бути в одній транзакції зі створенням order, бо очистка кошика це не критична транзакція
    await this.cartService.clear(userId);

    let paymentUrl: string | null = null;

    //Створюємо інвойс та payment. Це теж не критична транзакція
    if (dto.paymentMethod === 'CARD') {
      const invoiceResponseDto: InvoiceResponseDto = await this.paymentService.initializePayment(createdOrder.id, Number(createdOrder.amount));
      paymentUrl = invoiceResponseDto.paymentUrl;
    }

    return OrderMapper.toCheckoutResponseDto(createdOrder, paymentUrl);
  }

  //Створення ТТН та зміна статусу замовлення на PROCESSING (після оплати або підтвердження менеджером)
  async initProcessing(orderId: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow({
      where: {id: orderId},
      include: orderInclude,
    });

    if(order.status !== "PENDING") {
      throw new BadRequestException(`Не можливо змінити статус замовлення. Поточний статус ${order.status}`);
    }

    const setTrackingNumberDto = OrderMapper.toSetTrackingNumberDto(order);

    await this.deliveryService.setTrackingNumber(setTrackingNumberDto);

    const updatedOrder: OrderEntity = await this.prismaService.order.update({
      where: {id: orderId},
      data: { status: "PROCESSING" },
      include: orderInclude
    });

    return OrderMapper.toOrderResponseDto(updatedOrder);
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }



  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async create(userId: string, dto: CreateOrderDto, tx: Prisma.TransactionClient): Promise<OrderEntity> {
    const cart = await this.cartService.findOneByUserId(userId, tx);

    //Первіряєм чи кошик не пустий
    if (!cart.items.length) {
      throw new BadRequestException(`Не можна створити замовлення, оскільки кошик користувача з id ${userId} порожній`);
    }

    //Розраховуємо довжину замовлення по найбільшій висоті товару
    const lengthMm = cart.items.reduce((acc, item) => {
      return acc < item.product.heightMm
        ? item.product.heightMm
        : acc
    }, 0);
    //Розраховуємо вагу замовлення
    const weightGrams = cart.items.reduce((acc, item) => {
      return acc + (item.product.weightGrams * item.product.quantity);
    }, 0);

    //Перевіряємо відповідність метрик замовлення методу доставки
    this.deliveryService.verifyOrderMetrics(dto.delivery.method, lengthMm, weightGrams);

    //Створюємо Prisma.OrderCreateInput
    const data: OrderCreateInput = OrderMapper.toPrismaOrderCreateInput(userId, cart, dto);

    //Створюємо замовлення
    const order: OrderEntity = await tx.order.create({
      data,
      include: orderInclude
    });
    this.logger.log(`Замовлення з id ${order.id} успішно створено`);

    return order;
  }
}
