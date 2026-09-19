import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { NovaPoshtaProvider } from './infrastructure/nova-poshta.provider';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, NovaPoshtaProvider],
  exports: [DeliveryService]
})
export class DeliveryModule {}
