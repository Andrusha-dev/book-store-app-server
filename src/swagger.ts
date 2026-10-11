import type { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './core/config/app-config.schema';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//Функція ініціалізації документації swagger (запускається в main.ts)
export function initSwagger(app: INestApplication): void {
  const logger: Logger = app.get(Logger);
  const configService: ConfigService<AppConfig, true> = app.get(ConfigService<AppConfig, true>,);
  const port = configService.get<AppConfig["PORT"]>('PORT');
  const swaggerPath = 'api/v1/docs';

  const isProduction = configService.get<AppConfig['NODE_ENV']>('NODE_ENV') === 'production';

  if (isProduction) {
    return;
  }

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
  logger.log(`Swagger documentation is available on: http://localhost:${port}/${swaggerPath}`);
}