import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MonobankProvider } from './infrastructure/monobank.provider';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, MonobankProvider],
  exports: [PaymentService]
})
export class PaymentModule {}
