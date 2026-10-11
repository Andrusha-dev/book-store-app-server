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


  //Синхронізація замовлень із статусами перевізника
  @Cron(CronExpression.EVERY_MINUTE)
  async handleSyncOrderWithDelivery(): Promise<void> {
    try {
      await this.orderService.syncOrderWithDelivery();
      //Обовязково логуємо результат синхронізації, бо логер http запитів тут не працюватиме, бо це фоновий процес
      this.logger.log('Синхронізація статусів замовлень із відповідними статусами служби доставки пройшла успішно');
    } catch (error) {
      //Обовязково логуємо помилку, бо логер http запитів тут не працюватиме, бо це фоновий процес
      this.logger.error({ err: error as Error }, 'Під час синхронізації статусів замовлень із відповідними статусами служби доставки виникла помилка');
    }
  }

  //Скасування прострочених замовлень з попередньою синхронізацією замовлень з оплаченими оплатами
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCancelExpiredOrder(): Promise<void> {
    try {
      //Перед скасуванням прострочених замовлень слід обовязково синхронізувати замовлення із оплаченими оплатами, щоб випадково не скасувати оплачене замовлення
      await this.orderService.syncOrderWithPaidPayment();
      this.logger.log('Синхронізація статусів замовлень із оплаченими оплатами пройшла успішно');
      //Після синхронізації, з чистою совістю скасовуємо прострочені замовлення
      await this.orderService.cancelExpiredOrders();
      this.logger.log('Скасування прострочених замовлень пройшло успішно');
    } catch (error) {
      this.logger.error({err: error as Error}, 'При скасуванні прострочених замовлень сталась помилка')
    }
  }

  //Синхронізація замовлень з повернутими оплатами
  @Cron(CronExpression.EVERY_MINUTE)
  async handleSyncOrderWithRefundedPayment(): Promise<void> {
    try {
      //Синхронізуємо замовлення з повернутими оплатами
      await this.orderService.syncOrderWithRefundedPayment();
      this.logger.log('Синхронізація замовлень з повернутими оплатами пройшла успішно')
    } catch (error) {
      this.logger.error({err: error as Error}, 'При синхронізації замовлень з повернутими оплатами сталася помилка')
    }
  }
}