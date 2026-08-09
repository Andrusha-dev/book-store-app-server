import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { AppLoggerModule } from './logger/app-logger.module';
import { PrismaModule } from './database/prisma.module';


@Global()
@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule
  ],
  exports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule
  ],
})
export class CoreModule {}