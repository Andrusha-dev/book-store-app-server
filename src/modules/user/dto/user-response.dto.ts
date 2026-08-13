import { IdentityResponseDto } from './identity-response.dto';
import type { UserRole } from '../../../generated/prisma/enums';



export class UserResponseDto {
  id: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  birthYear?: number;
  isMarried: boolean;
  role: UserRole;
  createdAt: Date; //Date автоматично серіалізується в string
  updatedAt: Date; //Date автоматично серіалізується в string
  identities: IdentityResponseDto[];
}