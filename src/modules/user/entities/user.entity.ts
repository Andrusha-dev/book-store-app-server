import { Prisma } from '../../../generated/prisma/client';



export const userInclude = {
  identities: true,
} satisfies Prisma.UserInclude;

export type UserEntity = Prisma.UserGetPayload<{include: typeof userInclude}>;