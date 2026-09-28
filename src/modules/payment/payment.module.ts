import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MonobankProvider } from './infrastructure/monobank.provider';
import { MonobankWebhookGuard } from './guards/monobank-webhook.guard';
import { PaymentSuccessEvent } from './events/payment-success.event';
import { PaymentRefundedEvent } from './events/payment-refunded.event';
import { PaymentWebhookController } from './payment-webhook.controller';

@Module({
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, MonobankProvider, MonobankWebhookGuard],
  exports: [PaymentService]
})
export class PaymentModule {}
