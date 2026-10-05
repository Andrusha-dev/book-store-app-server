import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { PaymentModule } from '../payment/payment.module';
import { ProductModule } from '../product/product.module';
import { AdminOrderController } from './admin-order.controller';
//import { MonobankProvider } from '../payment/infrastructure/monobank.provider';
import { OrderPaymentListener } from './listeners/order-payment.listener';
import { OrderCronService } from './order-cron.service';


@Module({
  imports: [CartModule, DeliveryModule, PaymentModule, ProductModule],
  controllers: [AdminOrderController, OrderController],
  providers: [OrderService, OrderPaymentListener, OrderCronService]
})
export class OrderModule {}
