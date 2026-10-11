import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OrderNotificationListener } from './listeners/order-notification.listener';


@Module({
  providers: [NotificationService, OrderNotificationListener]
})
export class NotificationModule {}