import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './core/config/app-config.schema';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { initSwagger } from './swagger';



async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, //Накопичує логи доки не завантажиться кастомний логер (pino)
    forceCloseConnections: true, //Примусово закриває зєднання, якщо enableShutdownHooks не справляється
    rawBody: true, // Зберігає сире тіло запиту. Потрібно зокрема для криптографічної перевірки підпису вебхуків
  });

  //Отримуєм залежності
  const logger = app.get(Logger);
  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);
  //Динамічно дістаємо порт, який пройшов перевірку zod
  const port = configService.get<AppConfig["PORT"]>('PORT');

  //Підключаєм cookieParser (для зчитування http-only cookie)
  app.use(cookieParser());
  //Змінюєм стандартний логер на pino, щоб він виводив також системні логи та логи запитів(http-pino)
  app.useLogger(logger);
  //Правильне завершення роботи при ручному закритті сервера (закриття конектів до БД тощо)
  app.enableShutdownHooks();
  //Підключаєм вбудований cors
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGIN', {infer: true}),
    credentials: true, //Обов'язково для передачі Refresh Cookie
  });
  //Встановлюємо глобальний префікс маршрутів для версіонування API
  app.setGlobalPrefix('api/v1');
  //Ініціюєм swagger
  initSwagger(app);

  await app.listen(port);
  logger.log(`Bookstore API is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
