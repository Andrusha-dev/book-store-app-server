import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
import { ProductModule } from '../product/product.module';
import { AdminPublisherController } from './admin-publisher.controller';

@Module({
  imports: [ProductModule],
  controllers: [PublisherController, AdminPublisherController],
  providers: [PublisherService],
})
export class PublisherModule {}
