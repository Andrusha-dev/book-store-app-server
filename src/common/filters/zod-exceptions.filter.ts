import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error.dto';
import { z } from 'zod';


@Catch(z.ZodError)
export class ZodExceptionsFilter implements ExceptionFilter {
  catch(exception: z.ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    //Статус 500, тому що в цьому проекті zod використовується для валідації запитів до зовнішніх API
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    //Деталі помилки zod
    const message = `Помилка валідації: ${z.prettifyError(exception)}`;

    const errorResponseDto: ErrorResponseDto = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    //Передаємо `err` для pino-http ТІЛЬКИ якщо це реальна серверна помилка (500)
    response.err = exception;

    response.status(statusCode).json(errorResponseDto);
  }
}