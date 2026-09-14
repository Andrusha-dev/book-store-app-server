import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './core/config/app-config.schema';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';



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
  const port = configService.get('PORT', { infer: true });

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

  //Налаштування Swagger (достатньо 5 рядків)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookstore API')
    .setDescription('REST API для інтернет-магазину книг')
    .setVersion('1.0')
    .addBearerAuth() // Якщо надалі буде JWT авторизація
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Перший аргумент 'api/docs' — це URL шлях, за яким буде доступний Swagger UI
  SwaggerModule.setup('api/v1/docs', app, document);
  logger.log(`Swagger documentation is available on: http://localhost:${port}/api/docs`);

  await app.listen(port);
  logger.log(`Bookstore API is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
