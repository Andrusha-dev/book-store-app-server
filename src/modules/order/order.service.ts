import { BadRequestException, ForbiddenException, Get, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { OrderResponseDto } from './dto/order-response.dto';
import { OrderStatus, Prisma } from '../../generated/prisma/client';
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
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import type { ProductsQueryDto } from '../product/dto/products-query.dto';
import type { OrdersQueryDto } from './dto/orders-query.dto';
import type { OrdersResponseDto } from './dto/orders-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import type { PaymentEntity } from '../payment/entities/payment.entity';
import type { RetryPaymentResponseDto } from './dto/retry-payment-response.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly deliveryService: DeliveryService,
    private readonly paymentService: PaymentService,
    private readonly logger: Logger,
  ) {}

  async checkout(userId: string, dto: CreateOrderDto): Promise<CheckoutResponseDto> {
    const order = await this.prismaService.$transaction(
      async (tx) => {
        //Створюємо замовлення
        const order: OrderEntity = await this.create(userId, dto, tx);
        //Створюємо доставку
        await this.deliveryService.create(order.id, dto.delivery, tx);
        //Створюємо первинну оплату
        await this.paymentService.createWithoutExternalId(order.id, tx);
        //Списуємо товар
        for (const item of order.items) {
          await this.productService.decreaseQuantity(item.productId, item.quantity, tx);
        }
        //Очищуємо кошик
        await this.cartService.clear(userId, tx);

        return order;
      }
    );

    let paymentUrl: string | null = null;

    if (order.paymentMethod === 'CARD') {
      //Створюємо інвойс для первинної оплати. Створюється по-за блоком транзакцій, щоб платіжний сервер не гальмував виконання транзакцій
      const invoiceResponseDto: InvoiceResponseDto = await this.paymentService.createInvoice(order.id, Number(order.amount));
      paymentUrl = invoiceResponseDto.paymentUrl;
    }

    //Отримуєм оновлене замовлення (з доставкою та оплатою)
    const updatedOrder: OrderEntity = await this.prismaService.order.findUniqueOrThrow({
        where: { id: order.id },
        include: orderInclude,
      });
    return OrderMapper.toCheckoutResponseDto(updatedOrder, paymentUrl);
  }

  //Метод для повторного створення інвойсу, якщо попередній не створився, або оплата завершилась помилкою
  async retryPayment(orderId: string, userId: string): Promise<RetryPaymentResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow({
      where: {id: orderId, userId},
      include: orderInclude
    });

    if(order.status !== "PENDING") {
      throw new BadRequestException(`Для замовлення з ID ${orderId} не можливо повторити оплату при поточному статусі. Поточний статус ${order.status}`);
    }

    if(order.paymentMethod !== "CARD") {
      throw new BadRequestException(`Для замовлення з ID ${orderId} метод оплати ${order.paymentMethod}. Повторити оплату можна тільки при оплаті карткою`);
    }

    //Створюємо інвойс для існуючої оплати (без externalId) чи нової оплати (якщо оплати без externalId немає)
    const invoiceResponseDto = await this.paymentService.createInvoice(orderId, Number(order.amount));

    if(!invoiceResponseDto.paymentUrl) {
      throw new InternalServerErrorException('При спробі повторної оплати сталась помилка. Спробуйте пізніше');
    }

    return {paymentUrl: invoiceResponseDto.paymentUrl}
  }

  //Створення ТТН та зміна статусу замовлення на PROCESSING (після оплати карткою або підтвердження менеджером)
  async initProcessing(orderId: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow(
      {
        where: { id: orderId },
        include: orderInclude,
      },
    );
    //Первіряєм, чи замовлення має статус PENDING
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`Неможливо змінити статус замовлення. Поточний статус ${order.status}`);
    }

    //Якщо оплата картою, то перевіряємо чи замовлення оплачене
    if(order.paymentMethod === 'CARD') {
      const payment = await this.paymentService.findPaidByOrderId(orderId);

      if (!payment) {
        throw new BadRequestException(`Неможливо змінити статус замовлення при оплаті карткою, якщо воно не оплачене`,);
      }
    }

    const setTrackingNumberDto = OrderMapper.toSetTrackingNumberDto(order);
    const updatedOrder = await this.prismaService.$transaction(async (tx) => {
      //Генеруємо ТТН і прописуєм trackingNumber
      await this.deliveryService.setTrackingNumber(setTrackingNumberDto, tx);
      //Змінюємо статус замовлення на PROCESSING
      const updatedOrder: OrderEntity = await tx.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
        include: orderInclude,
      });
      this.logger.log(`В замовленні з ID ${orderId} статус успішно змінено на ${updatedOrder.status}`);

      return updatedOrder;
    })

    return OrderMapper.toOrderResponseDto(updatedOrder);
  }

  async findMany(queryDto: OrdersQueryDto, userId?: string, ): Promise<OrdersResponseDto> {
    const {pageNo, pageSize, sortOrder, sortBy, ...filters} = queryDto;

    const where: Prisma.OrderWhereInput = OrderMapper.toPrismaOrderWhereInput(filters, userId);

    const [orders, totalElements] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: pageSize * pageNo,
        include: orderInclude
      }),
      this.prismaService.order.count({where})
    ]);

    const data = orders.map((order) => OrderMapper.toOrderResponseDto(order));
    const meta = new PageMetaDto(pageNo, pageSize, totalElements);

    return {data, meta}
  }

  async findOne(id: string, userId?: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findFirstOrThrow({
      where: { id, userId },
      include: orderInclude
    });

    return OrderMapper.toOrderResponseDto(order);
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async create(
    userId: string,
    dto: CreateOrderDto,
    tx: Prisma.TransactionClient,
  ): Promise<OrderEntity> {
    const cart = await this.cartService.findOneByUserId(userId, tx);

    //Первіряєм чи кошик не пустий
    if (!cart.items.length) {
      throw new BadRequestException(
        `Не можна створити замовлення, оскільки кошик користувача з id ${userId} порожній`,
      );
    }

    //Розраховуємо довжину замовлення по найбільшій висоті товару
    const heightMm = cart.items.reduce((acc, item) => {
      return acc < item.product.heightMm ? item.product.heightMm : acc;
    }, 0);
    //Розраховуємо вагу замовлення
    const weightGrams = cart.items.reduce((acc, item) => {
      console.log(
        `item.product.weightGrams: ${item.product.weightGrams}, item.quantity: ${item.quantity}`,
      );
      return acc + item.product.weightGrams * item.quantity;
    }, 0);
    console.log(`weightGrams: ${weightGrams}`);

    //Перевіряємо відповідність метрик замовлення методу доставки
    this.deliveryService.verifyOrderMetrics(
      dto.delivery.method,
      heightMm,
      weightGrams,
    );

    //Створюємо Prisma.OrderCreateInput
    const data: OrderCreateInput = OrderMapper.toPrismaOrderCreateInput(userId, cart, dto);

    //Створюємо замовлення
    const order: OrderEntity = await tx.order.create({
      data,
      include: orderInclude,
    });
    this.logger.log(`Замовлення з id ${order.id} успішно створено`);

    return order;
  }
}
