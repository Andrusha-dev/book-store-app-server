import type { IdentityProvider } from '../../../generated/prisma/enums';


//Тип для даних, які повертають OAuth стратегії (GoogleStrategy, GithubStrategy та ін.)
export interface IOAuthUser {
  provider: IdentityProvider;
  providerId: string;
  email: string;
}