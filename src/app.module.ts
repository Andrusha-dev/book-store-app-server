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
import { IdentityModule } from './modules/identity/identity.module';




@Module({
  imports: [CoreModule, UserModule, AuthModule, IdentityModule],
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
    }
  ],
})
export class AppModule {}
