import { ApiProperty } from '@nestjs/swagger';
import type { IdentityEntity } from '../entities/identity.entity';
import type { IdentityProvider } from '../../../generated/prisma/enums';


export class IdentityResponseDto {
  @ApiProperty({ example: 'hgf4jk65ghf6' })
  id: string;

  @ApiProperty({ example: 'LOCAL' })
  provider: IdentityProvider;

  @ApiProperty({ example: 'user_654cgs' })
  providerId: string;

  @ApiProperty({ example: 'hgf4jk65ghf6' })
  passwordHash?: string;

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  createdAt: string;

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  updatedAt: string;

  @ApiProperty({example: "hgf4jk65ghf6"})
  userId: string;

  static fromEntity(identityEntity: IdentityEntity): IdentityResponseDto {
    const responseDto: IdentityResponseDto = {
      id: identityEntity.id,
      provider: identityEntity.provider,
      providerId: identityEntity.providerId,
      createdAt: identityEntity.createdAt.toISOString(),
      updatedAt: identityEntity.updatedAt.toISOString(),
      userId: identityEntity.userId
    }

    return responseDto;
  }
}