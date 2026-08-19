import { Injectable, ValidationPipe } from '@nestjs/common';


@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      //transformOptions: {
        //enableImplicitConversion: true, //Автоматично приводиться строки в базові типи
        //exposeDefaultValues: true, //КРИТИЧНО ВАЖЛИВО: змушує NestJS створювати екземпляр dto і застосовувати значення за змовчуванням для полів dto (в деяких версіях class-transformer)
      //},
    });
  }
}