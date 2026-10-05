import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
import type { OrdersQueryDto } from './dto/orders-query.dto';
import type { OrdersResponseDto } from './dto/orders-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
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

  async checkout(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<CheckoutResponseDto> {
    const order = await this.prismaService.$transaction(async (tx) => {
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
    });

    let paymentUrl: string | null = null;

    if (order.paymentMethod === 'CARD') {
      //Створюємо інвойс для первинної оплати. Створюється по-за блоком транзакцій, щоб платіжний сервер не гальмував виконання транзакцій
      const invoiceResponseDto: InvoiceResponseDto =
        await this.paymentService.createInvoice(order.id, Number(order.amount));
      paymentUrl = invoiceResponseDto.paymentUrl;
    }

    //Отримуєм оновлене замовлення (з доставкою та оплатою)
    const updatedOrder: OrderEntity =
      await this.prismaService.order.findUniqueOrThrow({
        where: { id: order.id },
        include: orderInclude,
      });
    return OrderMapper.toCheckoutResponseDto(updatedOrder, paymentUrl);
  }

  //Метод для повторного створення інвойсу, якщо попередній не створився, або оплата завершилась помилкою
  async retryPayment(
    orderId: string,
    userId: string,
  ): Promise<RetryPaymentResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow(
      {
        where: { id: orderId, userId },
        include: orderInclude,
      },
    );

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Для замовлення з ID ${orderId} не можливо повторити оплату при поточному статусі. Поточний статус ${order.status}`,
      );
    }

    if (order.paymentMethod !== 'CARD') {
      throw new BadRequestException(
        `Для замовлення з ID ${orderId} метод оплати ${order.paymentMethod}. Повторити оплату можна тільки при оплаті карткою`,
      );
    }

    //Створюємо інвойс для існуючої оплати (без externalId) чи нової оплати (якщо оплати без externalId немає)
    const invoiceResponseDto = await this.paymentService.createInvoice(
      orderId,
      Number(order.amount),
    );

    //Пересвідчуємося, що посилання на оплату дійсно є
    if (!invoiceResponseDto.paymentUrl) {
      throw new InternalServerErrorException(
        'При спробі повторної оплати сталась помилка. Спробуйте пізніше',
      );
    }
    //Якщо є, то повертаємо посилання на оплату
    return { paymentUrl: invoiceResponseDto.paymentUrl };
  }

  //Створення ТТН та зміна статусу замовлення на PROCESSING (після оплати карткою або підтвердження менеджером)
  async processOrder(orderId: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow(
      {
        where: { id: orderId },
        include: orderInclude,
      },
    );
    //Первіряєм, чи замовлення має статус PENDING
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Неможливо змінити статус замовлення. Поточний статус ${order.status}`,
      );
    }

    //Якщо оплата картою, то перевіряємо чи замовлення оплачене
    if (order.paymentMethod === 'CARD') {
      const payment = await this.paymentService.findPaidByOrderId(orderId);
      if (!payment) {
        throw new BadRequestException(
          `Неможливо змінити статус замовлення при оплаті карткою, якщо воно не оплачене`,
        );
      }
    }

    const setTrackingNumberDto = OrderMapper.toCreateTrackingNumberDto(order);
    //Генеруєм ТТН
    const trackingNumber =
      await this.deliveryService.createTrackingNumber(setTrackingNumberDto);
    const updatedOrder = await this.prismaService.$transaction(async (tx) => {
      //Оновлюєм trackingNumber доставки отриманим значенням ТТН
      await this.deliveryService.updateTrackingNumberByOrderId(
        orderId,
        trackingNumber,
        tx,
      );
      //Змінюємо статус замовлення на PROCESSING
      const updatedOrder: OrderEntity = await tx.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
        include: orderInclude,
      });
      this.logger.log(
        `В замовленні з ID ${orderId} статус успішно змінено на ${updatedOrder.status}`,
      );

      return updatedOrder;
    });

    return OrderMapper.toOrderResponseDto(updatedOrder);
  }

  //Метод для скасування замовлення
  async cancelOrder(id: string, userId?: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findFirstOrThrow({
      where: { id, userId },
      include: orderInclude,
    });

    //Якщо, при оплаті карткою, замовлення вже оплачене (має статус PROCESSING), то ініціюєм повернення коштів і повертаємо замовлення з поточним статусом PROCESSING
    //Подальша зміна статусу замовлення буде здійснюватись через обробку вебхуку монобанку після повернення коштів
    if (order.paymentMethod === 'CARD' && order.status === 'PROCESSING') {
      await this.paymentService.refundPayment(order.id, Number(order.amount));
      return OrderMapper.toOrderResponseDto(order);
    }

    //Якщо оплата не здійснювалась то відразу змінюєм статус замовлення на CANCELLED
    return await this.updateStatusToCancelled(id);
  }

  //Метод, який безпосередньо змінює статус замовлення на CANCELLED
  async updateStatusToCancelled(id: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow(
      {
        where: { id },
        include: orderInclude,
      },
    );
    //Якщо замовлення вже в перевізника або виконане чи скасоване, то скасувати його не можна
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new BadRequestException(`Не можливо скасувати замовлення з ID ${id}, якщо воно передано перевізнику або вже виконане/скасоване. Статус замовлення ${order.status}`);
    }
    //Перевіряєм чи є повернута оплата, інакше скасовувати замовлення не можна
    if (order.paymentMethod === 'CARD' && order.status === 'PROCESSING') {
      const refundedPayment = await this.paymentService.findRefundedByOrderId(id);
      if (!refundedPayment) {
        throw new BadRequestException(`В замовленні з ID ${id} не можливо змінити статус з ${OrderStatus.PROCESSING} на ${OrderStatus.CANCELLED}, при оплаті карткою, якщо оплата не повернута`,);
      }
    }

    const cancelledOrder: OrderEntity = await this.prismaService.$transaction(async (tx) => {
      //Повертаємо товар на склад
      for (const item of order.items) {
        await this.productService.increaseQuantity(item.productId, item.quantity, tx);
      }
      this.logger.log(`Повернення товару на склад, при скасуванні замовлення з ID${id}, успішно виконано`);

      //І змінюєм статус замовлення на CANCELLED
      const updatedOrder: OrderEntity = await tx.order.update(
        {
          where: { id },
          data: { status: 'CANCELLED' },
          include: orderInclude,
        },
      );
      this.logger.log(`Для замовлення з ID${updatedOrder.id} змінено статус на ${updatedOrder.status}`);

      return updatedOrder;
    });

    return OrderMapper.toOrderResponseDto(cancelledOrder);
  }

  async findMany(
    queryDto: OrdersQueryDto,
    userId?: string,
  ): Promise<OrdersResponseDto> {
    const { pageNo, pageSize, sortOrder, sortBy, ...filters } = queryDto;

    const where: Prisma.OrderWhereInput = OrderMapper.toPrismaOrderWhereInput(
      filters,
      userId,
    );

    const [orders, totalElements] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: pageSize * pageNo,
        include: orderInclude,
      }),
      this.prismaService.order.count({ where }),
    ]);

    const data = orders.map((order) => OrderMapper.toOrderResponseDto(order));
    const meta = new PageMetaDto(pageNo, pageSize, totalElements);

    return { data, meta };
  }

  async findOne(id: string, userId?: string): Promise<OrderResponseDto> {
    const order: OrderEntity = await this.prismaService.order.findFirstOrThrow({
      where: { id, userId },
      include: orderInclude,
    });

    return OrderMapper.toOrderResponseDto(order);
  }

  //Синхронізація статусу замовлення зі статусом нової пошти (використовується в cron процесі або може викликатись вручну адміном через відповідний маршрут)
  async syncOrderStatusesWithDelivery(): Promise<void> {
    //Шукаємо замовлення зі поточними статусами PROCESSING та DELIVERING
    const orders: OrderEntity[] = await this.prismaService.order.findMany({
      where: {
        status: { in: [OrderStatus.PROCESSING, OrderStatus.DELIVERING] },
      },
      include: orderInclude,
    });
    //Отримуєм номера ТТН через ассерцію !, адже замовлення має статус PROCESSING лише при фактичній наявності ТТН в доставці
    const trackingNumbers = orders.map(order => order.delivery!.trackingNumber!);
    //Отримуємо обєкти з номерами ТТН та статусами доставки для них
    const trackingStatusItems = await this.deliveryService.getTrackingStatusItems(trackingNumbers);
    this.logger.log(trackingStatusItems);

    for (const item of trackingStatusItems) {
      //Мапимо внутрішній статус нової пошти до OrderStatus
      const necessaryStatus: OrderStatus = OrderMapper.toOrderStatus(item.statusValue);
      //Шукаєм необхіднеу доставку по номеру ТТН
      const delivery = await this.deliveryService.findOneByTrackingNumber(item.trackingNumber);
      //Знаходим замовлення, якому належить ця доставка
      const order: OrderEntity = await this.prismaService.order.findUniqueOrThrow({
          where: { id: delivery.orderId },
          include: orderInclude,
        });
      //Перевіряємо, чи відповідає поточний статус замовлення необхідному статусу. Якщо ні, то оновлюєм статус замовлення до актуального
      if (order.status !== necessaryStatus) {
        const updatedOrder: OrderEntity = await this.prismaService.order.update(
          {
            where: { id: order.id },
            data: { status: necessaryStatus },
            include: orderInclude,
          },
        );
        this.logger.log(`Для замовлення з ID${updatedOrder.id} змінено статус на ${updatedOrder.status}`);
      }
    }
  }

  //Приватний метод для безпосереднього створення замовлення (викликається в checkout())
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
    const data: OrderCreateInput = OrderMapper.toPrismaOrderCreateInput(
      userId,
      cart,
      dto,
    );

    //Створюємо замовлення
    const order: OrderEntity = await tx.order.create({
      data,
      include: orderInclude,
    });
    this.logger.log(`Замовлення з id ${order.id} успішно створено`);

    return order;
  }
}
