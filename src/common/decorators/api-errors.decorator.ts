import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error.dto';


export const ApiErrors = () => {
  return applyDecorators(
    ApiBadRequestResponse({description: 'Bad request / Помилка валідації даних', type: ErrorResponseDto}),
    ApiUnauthorizedResponse({description: 'Unauthorized / Користувач не автентифікований', type: ErrorResponseDto}),
    ApiForbiddenResponse({description: 'Forbidden / Користувач не має прав доступу', type: ErrorResponseDto}),
    ApiNotFoundResponse({description: 'Not found / Ресурс не знайдено', type: ErrorResponseDto}),
    ApiConflictResponse({description: 'Conflict / Конфлікт даних', type: ErrorResponseDto}),
    ApiInternalServerErrorResponse({description: 'Internal server error / Помилка сервера', type: ErrorResponseDto})
  );
}