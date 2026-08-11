import { ApiProperty } from '@nestjs/swagger';
import { IdentityResponseDto } from './identity-response.dto';
import type { UserRole } from '../../../generated/prisma/enums';



export class UserResponseDto {
  @ApiProperty({example: "hgf4jk65ghf6"})
  id: string;

  @ApiProperty({example: "johndoe@gmail.com"})
  email: string;

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
  createdAt: Date; //Date автоматично серіалізується в string

  @ApiProperty({example: "2023-01-01T00:00:00.000Z"})
  updatedAt: Date; //Date автоматично серіалізується в string

  identities: IdentityResponseDto[];
}