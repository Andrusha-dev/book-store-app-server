import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { AppLoggerModule } from './logger/app-logger.module';
import { PrismaModule } from './database/prisma.module';
import { AppEventEmitterModule } from './event/app-event-emitter.module';
import { AppScheduleModule } from './schedule/app-schedule.module';


@Global()
@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AppEventEmitterModule,
    AppScheduleModule,
    PrismaModule
  ],
  exports: [
    AppConfigModule,
    AppLoggerModule,
    AppEventEmitterModule,
    AppScheduleModule,
    PrismaModule
  ],
})
export class CoreModule {}