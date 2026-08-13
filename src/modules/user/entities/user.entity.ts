import { type Identity, Prisma } from '../../../generated/prisma/client';



export const userInclude = {
  identities: true,
} satisfies Prisma.UserInclude;

export type UserEntity = Prisma.UserGetPayload<{include: typeof userInclude}>;

//IdentityEntity не містить реляцій
export type IdentityEntity = Identity;