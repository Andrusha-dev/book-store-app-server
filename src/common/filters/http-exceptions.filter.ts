import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error.dto';


@Catch(HttpException) //Чітко вказуємо, що ловимо тільки HttpException
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message: string | string[] = typeof exceptionResponse === 'string'
      ? exceptionResponse
      //Повертаємо поле exceptionResponse.message, якщо є, інакше повертаємо exception.message
      : ((exceptionResponse as Record<string, unknown>)?.message as string | string[]) || exception.message;

    const errorResponseDto: ErrorResponseDto = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    //Нічого не логуєм, бо логуванням помилок автоматично займається pino-http

    //Відправляємо відповідь клієнту
    response.status(statusCode).json(errorResponseDto);
  }
}
