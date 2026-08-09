import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from '../config/app-config.module';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/app-config.schema';


@Module({
  imports: [
    //Використовуємо саме forRootAsync, бо нам важливо щоб завантажився AppConfigModule
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const isProduction = configService.get('NODE_ENV', { infer: true }) === 'production';

        return {
          pinoHttp: {
            transport: !isProduction
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
            //Для помилок 5xx — error, для 4xx — warn
            customLogLevel: (_req, res, err) => {
              if (res.statusCode >= 500 || err) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
          },
        };
      },
    }),
  ],
  exports: [LoggerModule], //Експортуємо, щоб інші модулі могли використовувати Logger, якщо треба
})
export class AppLoggerModule {}