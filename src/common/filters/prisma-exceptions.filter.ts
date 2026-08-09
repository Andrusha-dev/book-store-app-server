import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';
import { ErrorResponseDto } from '../dto/error.dto';


@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionsFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';


    // Мапінг кодів помилок PostgreSQL
    switch (exception.code) {
      // Помилка унікальності (наприклад, дублікат email або унікального поля)
      case 'P2002': {
        statusCode = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${target} already exists.`;
        break;
      }

      // Запис не знайдено (наприклад, при спробі оновити або видалити неіснуючий id)
      case 'P2025': {
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Requested record was not found.';
        break;
      }

      // Помилка зовнішнього ключа (Foreign key constraint violation)
      case 'P2003': {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed. Related record does not exist.';
        break;
      }

      default:
        // Для інших помилок залишаємо стандартну поведінку
        break;
    }


    //Передаємо `err` для pino-http ТІЛЬКИ якщо це реальна серверна помилка (500)
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      response.err = exception;
    }


    const errorResponseDto: ErrorResponseDto = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    response.status(statusCode).json(errorResponseDto);
  }
}