import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderService } from '../order.service';
import { PaymentSuccessEvent } from '../../payment/events/payment-success.event';
import { Logger } from 'nestjs-pino';
import { PaymentRefundedEvent } from '../../payment/events/payment-refunded.event';

@Injectable()
export class OrderPaymentListener {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger
  ) {}


  @OnEvent("payment.success", {async: true})
  async handlePaymentSuccess(event: PaymentSuccessEvent): Promise<void> {
    try {
      await this.orderService.initProcessing(event.orderId);
    } catch (error) {
      this.logger.error({err: error as Error}, "Не вдалось створити ТТН та оновити статус замовлення");
    }
  }

  @OnEvent("payment.refunded", {async: true})
  async handlePaymentRefunded(event: PaymentRefundedEvent): Promise<void> {
    //Тут буде викликатись метод повернення коштів
  }
}