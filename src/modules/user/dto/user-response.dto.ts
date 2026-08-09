import { ApiProperty } from '@nestjs/swagger';
import { IdentityResponseDto } from '../../identity/dto/identity-response.dto';
import type { UserEntity } from '../entities/user.entity';
import type { UserRole } from '../../../generated/prisma/enums';


export class UserResponseDto {
  @ApiProperty({example: "hgf4jk65ghf6"})
  id: string;

  @ApiProperty({example: "johndoe@gmail.com"})
  email: string;

  @ApiProperty({example: "very_difficult_password"})
  passwordHash?: string;

  @ApiProperty({example: "JohnDoe"})
  username?: string;

  @ApiProperty({example: "John"})
  firstname?: string;

  @ApiProperty({example: "Doe"})
  lastname?: string;

  @ApiProperty({example: "+380991234567"})
  phone?: string;

  @ApiProperty({example: "1986"})
  birthYear?: number;

  @ApiProperty({example: true})
  isMarried: boolean;

  @ApiProperty({ example: "USER" })
  role: UserRole;

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  createdAt: string; //Можна вказувати Date, а не string, бо Date автоматично серіалізується в string

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  updatedAt: string; //Можна вказувати Date, а не string, бо Date автоматично серіалізується в string

  identities: IdentityResponseDto[];

  //Статичний метод для маппінгу UserEntity в UserResponseDto
  static fromEntity(userEntity: UserEntity) {
    const responseDto: UserResponseDto = {
      id: userEntity.id,
      email: userEntity.email,
      passwordHash: userEntity.passwordHash ?? undefined,
      username: userEntity.username ?? undefined,
      firstname: userEntity.firstname ?? undefined,
      lastname: userEntity.lastname ?? undefined,
      phone: userEntity.phone ?? undefined,
      birthYear: userEntity.birthYear ?? undefined,
      isMarried: userEntity.isMarried,
      role: userEntity.role,
      createdAt: userEntity.createdAt.toISOString(),
      updatedAt: userEntity.updatedAt.toISOString(),
      identities: userEntity.identities.map(identityEntity => IdentityResponseDto.fromEntity(identityEntity))
    }

    return responseDto;
  }
}