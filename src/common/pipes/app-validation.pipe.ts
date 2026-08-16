import { Injectable, ValidationPipe } from '@nestjs/common';


@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, //КРИТИЧНО ВАЖЛИВО: змушує NestJS створювати екземпляр dto і застосовувати значення за змовчуванням для полів dto
      },
    });
  }
}