import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderService } from '../order.service';
import { PaymentSuccessEvent } from '../../payment/events/payment-success.event';
import { Logger } from 'nestjs-pino';
import { PaymentRefundedEvent } from '../../payment/events/payment-refunded.event';
import { OrderStatus } from '../../../generated/prisma/enums';

@Injectable()
export class OrderPaymentListener {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger
  ) {}


  @OnEvent("payment.success", {async: true})
  async handlePaymentSuccess(event: PaymentSuccessEvent): Promise<void> {
    try {
      await this.orderService.processOrder(event.orderId);
    } catch (error) {
      this.logger.error({ err: error as Error }, `Для замовлення з ID${event.orderId} не вдалось створити ТТН та оновити статус до ${OrderStatus.PROCESSING}`,);
    }
  }

  @OnEvent("payment.refunded", {async: true})
  async handlePaymentRefunded(event: PaymentRefundedEvent): Promise<void> {
    try {
      await this.orderService.updateStatusToCancelled(event.orderId);
    } catch (error) {
      this.logger.error({ err: error as Error }, `Для замовлення з ID${event.orderId} не вдалось змінити статус на ${OrderStatus.CANCELLED}`,);
    }
  }
}