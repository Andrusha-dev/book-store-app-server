import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/error.dto';
import { Request, Response } from 'express';



@Catch() //Ніякі аргументи не передавати, бо він має перехоплювати всі помилки, які пройшли через попередні фільтри
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const error = exception instanceof Error ? exception : new Error(String(exception));//Гарантуєм, що помилка точно є екземпляром Error
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message: string = "Internal server error";

    const errorResponseDto: ErrorResponseDto = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    /*
    //Ручне логування для відображення стеку помилки в лозі
    const logData = {
      err: error,
      statusCode: statusCode,
      path: request.url,
      method: request.method,
    };

    this.logger.error(
      logData,
      `[${request.method}] ${request.url} - ${status}`,
    );
     */

    //Передаємо помилку в response.err і pino-http додасть її стек в лог
    response.err = error

    //Відправляємо відповідь клієнту
    response.status(statusCode).json(errorResponseDto);
  }
}