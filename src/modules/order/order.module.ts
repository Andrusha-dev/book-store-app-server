import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { PaymentModule } from '../payment/payment.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [CartModule, DeliveryModule, PaymentModule, ProductModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
