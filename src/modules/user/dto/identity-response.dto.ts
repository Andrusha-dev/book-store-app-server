import type { IdentityProvider } from '../../../generated/prisma/enums';


export class IdentityResponseDto {
  id: string;
  provider: IdentityProvider;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}