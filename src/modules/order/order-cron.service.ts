import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';
import { Logger } from 'nestjs-pino';
import { OrderStatus } from '../../generated/prisma/enums';
import type { DeliveryService } from '../delivery/delivery.service';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrderCronService {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger
  ) {}


  @Cron(CronExpression.EVERY_MINUTE)
  async handleOrderStatusSync(): Promise<void> {
    try {
      await this.orderService.syncOrderStatusesWithDelivery();
      //Обовязково логуємо результат синхронізації, бо логер http запитів тут не працюватиме, бо це фоновий процес
      this.logger.log('Синхронізація статусів замовлень із відповідними статусами служби доставки пройшла успішно');
    } catch (error) {
      //Обовязково логуємо помилку, бо логер http запитів тут не працюватиме, бо це фоновий процес
      this.logger.error({ err: error as Error }, 'Під час синхронізації статусів замовлень із відповідними статусами служби доставки виникла помилка');
    }
  }
}