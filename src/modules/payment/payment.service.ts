import { Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { PaymentResponseDto } from './dto/payment-response.dto';
import { Prisma } from '../../generated/prisma/client';
import { PaymentMapper } from './payment.mapper';
import type { PaymentEntity } from './entities/payment.entity';
import type { MonobankService } from './infrastructure/monobank.service';
import type { InvoiceResponseDto } from './dto/invoice-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly monobankService: MonobankService,
    private readonly logger: Logger
  ) {}


  async initializePayment(orderId: string, amount: number): Promise<InvoiceResponseDto> {
    const output = await this.monobankService.createInvoice(orderId, amount);

    await this.create(output.invoiceId, orderId);

    return {
      paymentUrl: output.pageUrl
    }
  }

  private async create(externalId: string, orderId: string): Promise<PaymentResponseDto> {
    const data = PaymentMapper.toPrismaCreateInput(externalId, orderId);

    const payment: PaymentEntity = await this.prismaService.payment.create({data});
    this.logger.log(`Оплата з id ${payment.id} успішно створена для замовлення з id ${payment.orderId}`);

    return PaymentMapper.toResponseDto(payment);
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
}
