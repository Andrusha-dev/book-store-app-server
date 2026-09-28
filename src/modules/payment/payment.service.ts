import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { PaymentResponseDto } from './dto/payment-response.dto';
import { type OrderPaymentMethod, type PaymentStatus, Prisma } from '../../generated/prisma/client';
import { PaymentMapper } from './payment.mapper';
import type { PaymentEntity } from './entities/payment.entity';
import { MonobankProvider } from './infrastructure/monobank.provider';
import type { InvoiceResponseDto } from './dto/invoice-response.dto';
import type { MonobankWebhookDto } from './dto/monobank-webhook.dto';
import type { OrderEntity } from '../order/entities/order.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentSuccessEvent } from './events/payment-success.event';
import { PaymentRefundedEvent } from './events/payment-refunded.event';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly monobankProvider: MonobankProvider,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger,
  ) {}

  //Створює сутність оплати в бд (без externalId)
  async createWithoutExternalId(
    orderId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentEntity> {
    const dbClient = tx ?? this.prismaService;

    const data = PaymentMapper.toPrismaCreateInput(orderId);

    const payment: PaymentEntity = await dbClient.payment.create({ data });
    this.logger.log(
      `Оплата з id ${payment.id} успішно створена для замовлення з id ${payment.orderId}`,
    );

    return payment;
  }

  async createInvoice(orderId: string, amount: number): Promise<InvoiceResponseDto> {
    let paymentUrl: string | null = null;

    try {
      //Перевіряємо чи замовлення має оплачену оплату
      const paidPayment = await this.findPaidByOrderId(orderId);
      if(paidPayment) {
        throw new BadRequestException(`Замовлення з ID ${orderId} вже оплачене. Оплата з ID ${paidPayment.id}`);
      }

      //Створюєм інвойс
      const createInvoiceResponse = await this.monobankProvider.createInvoice(orderId, amount);

      //Перевіряєм, чи вже існує оплата без externalId
      const paymentWithoutExternalId = await this.findWithoutExternalIdByOrderId(orderId);
      //Якщо так, встановлюєм для неї externalId
      if (paymentWithoutExternalId) {
        await this.prismaService.payment.update({
          where: { id: paymentWithoutExternalId.id },
          data: { externalId: createInvoiceResponse.invoiceId },
        });
      } else {
        //Якщо ні, створюєм нову оплату і призначаєм для неї externalId
        const data = PaymentMapper.toPrismaCreateInput(orderId, createInvoiceResponse.invoiceId);
        await this.prismaService.payment.create({ data });
      }

      paymentUrl = createInvoiceResponse.pageUrl;
    } catch (error) {
      //Глушимо помилку і логуємо її
      this.logger.error({ err: error as Error }, 'При створенні інвойсу чи оновленні/створенні оплати сталася помилка');
    }

    return {paymentUrl}
  }

  //Метод для оновлення статусу оплати через вебхук
  async updateStatusByWebhook(dto: MonobankWebhookDto): Promise<void> {
    let status: PaymentStatus;

    switch (dto.status) {
      case 'success':
        status = 'PAID';
        break;
      case 'failure':
        status = 'FAILED';
        break;
      case 'expired':
        status = 'FAILED';
        break;
      case 'reversed':
        status = 'REFUNDED';
        break;
      default:
        status = 'PENDING';
        break;
    }

    //Якщо статус початковий (PENDING), завершуємо метод
    if (status === 'PENDING') {
      return
    }

    //Перевіряєм, чи є оплата з відповідним externalId
    const payment = await this.findByExternalId(dto.invoiceId);
    //Якщо немає (наприклад коли після створенні інйвойсу, не вдалось створити оплату) завершуєм метод, бо не існує оплати із цим externalId
    if (!payment) {
      return
    }
    //Якщо оплата з цим externalId є, то оновлюєм її статус
    await this.prismaService.payment.update({
      where: {id: payment.id},
      data: { status },
    });

    if(status === "PAID") {
      this.eventEmitter.emit("payment.success", new PaymentSuccessEvent(payment.orderId));
    } else if (status === "REFUNDED") {
      this.eventEmitter.emit("payment.refunded", new PaymentRefundedEvent(payment.orderId));
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  //Шукає в замовленні оплачену оплату
  async findPaidByOrderId(orderId: string): Promise<PaymentResponseDto | undefined> {
    const payment: PaymentEntity | null =
      await this.prismaService.payment.findFirst({
        where: { orderId, status: 'PAID'}
      });

    if (payment) {
      return PaymentMapper.toResponseDto(payment);
    }

    return undefined;
  }

  //Шукає в замовленні оплату без externalId
  async findWithoutExternalIdByOrderId(orderId: string): Promise<PaymentResponseDto | undefined> {
    const payments: PaymentEntity[] = await this.prismaService.payment.findMany({ where: {orderId}});

    const payment: PaymentEntity | undefined = payments.find(payment => payment.status === "PENDING" && payment.externalId === null);

    if (payment) {
      return PaymentMapper.toResponseDto(payment);
    }

    return undefined;
  }

  async findByExternalId(externalId: string): Promise<PaymentResponseDto | undefined> {
    const payment: PaymentEntity | null = await this.prismaService.payment.findUnique({ where: {externalId} });

    if(payment) {
      return PaymentMapper.toResponseDto(payment);
    }

    return undefined;
  }
}
