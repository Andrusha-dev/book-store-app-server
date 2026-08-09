import type { IdentityProvider } from '../../../generated/prisma/enums';



export interface IOAuthUser {
  provider: IdentityProvider;
  providerId: string;
  email: string;
}