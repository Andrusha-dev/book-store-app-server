import type { UserRole } from '../../generated/prisma/enums';


export interface ITokenPayload {
  id: string;
  email: string;
  role: UserRole;
}