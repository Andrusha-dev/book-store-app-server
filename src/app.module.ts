import {
  Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppValidationPipe } from './common/pipes/app-validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionsFilter } from './common/filters/prisma-exceptions.filter';
import { UserModule } from './modules/user/user.module';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthorModule } from './modules/author/author.module';
import { PublisherModule } from './modules/publisher/publisher.module';
import { CartModule } from './modules/cart/cart.module';




@Module({
  imports: [CoreModule, UserModule, AuthModule, ProductModule, CategoryModule, AuthorModule, PublisherModule, CartModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionsFilter,
    },
  ],
})
export class AppModule {}
