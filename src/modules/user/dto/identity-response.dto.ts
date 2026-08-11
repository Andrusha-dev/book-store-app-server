import { ApiProperty } from '@nestjs/swagger';
import type { IdentityProvider } from '../../../generated/prisma/enums';


export class IdentityResponseDto {
  @ApiProperty({ example: 'hgf4jk65ghf6' })
  id: string;

  @ApiProperty({ example: 'GOOGLE' })
  provider: IdentityProvider;

  @ApiProperty({ example: 'user_654cgs' })
  providerId: string;

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  createdAt: Date;

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  updatedAt: Date;

  @ApiProperty({example: "hgf4jk65ghf6"})
  userId: string;
}