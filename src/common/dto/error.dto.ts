import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({example: '2023-01-01T00:00:00.000Z'})
  timestamp: string;

  @ApiProperty({example: '/api/v1/books'})
  path: string;

  @ApiProperty({example: 'POST'})
  method: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Validation failed'},
      { type: 'array', items: { type: 'string' }, example: ['username must be a string'] }
    ],
    description: 'Повідомлення про помилку (рядок або масив рядків)',
  })
  message: string | string[];
}