import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { Logger } from 'nestjs-pino';
import type { OrderCreatedEvent } from '../../../modules/order/events/order-created.event';
import type { OrderProcessingEvent } from '../../../modules/order/events/order-processing.event';
import type { OrderCancelledEvent } from '../../../modules/order/events/order-cancelled.event';
import type { OrderDeliveringEvent } from '../../../modules/order/events/order-delivering.event';
import type { OrderCompletedEvent } from '../../../modules/order/events/order-completed.event';


@Injectable()
export class OrderNotificationListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: Logger
  ) {}

  @OnEvent("order.created", {async: true})
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const subject = `Створення замовлення №${event.orderId}`;
    const html = `<h1>Вітаємо. Ваше замовлення за №${event.orderId} успішно створено</h1>`

    try {
      await this.notificationService.sendEmail(event.email, subject, html);
    } catch (error) {
      this.logger.error({err: error as Error }, `Не вдалось надіслати повідомлення на email ${event.email}`);
    }
  }

  @OnEvent("order.processing", {async: true})
  async handleOrderProcessing(event: OrderProcessingEvent): Promise<void> {
    const subject = `Комплектування замовлення №${event.orderId}`;
    const html = `<h1>Вітаємо. Ваше замовлення за №${event.orderId} підтверджене і комплектується</h1>`

    try {
      await this.notificationService.sendEmail(event.email, subject, html);
    } catch (error) {
      this.logger.error({err: error as Error}, `Не вдалось надіслати повідомлення на email ${event.email}`);
    }
  }

  @OnEvent("order.delivering", {async: true})
  async handleOrderDelivering(event: OrderDeliveringEvent): Promise<void> {
    const subject = `Доставка замовлення №${event.orderId}`;
    const html = `<h1>Вітаємо. Ваше замовлення за №${event.orderId} передане перевізнику</h1>`;

    try {
      await this.notificationService.sendEmail(event.email, subject, html);
    } catch (error) {
      this.logger.error({ err: error as Error }, `Не вдалось надіслати повідомлення на email ${event.email}`);
    }
  }

  @OnEvent("order.completed", {async: true})
  async handleOrderCompleted(event: OrderCompletedEvent): Promise<void> {
    const subject = `Отримання замовлення №${event.orderId}`;
    const html = `<h1>Вітаємо. Ви успішно отримали замовлення за №${event.orderId}</h1>`;

    try {
      await this.notificationService.sendEmail(event.email, subject, html);
    } catch (error) {
      this.logger.error({ err: error as Error }, `Не вдалось надіслати повідомлення на email ${event.email}`);
    }
  }

  @OnEvent("order.cancelled", {async: true})
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    const subject = `Скасування замовлення №${event.orderId}`;
    const html = `<h1>Ваше замовлення за №${event.orderId} скасоване</h1>`;

    try {
      await this.notificationService.sendEmail(event.email, subject, html);
    } catch (error) {
      this.logger.error({ err: error as Error }, `Не вдалось надіслати повідомлення на email ${event.email}`);
    }
  }
}