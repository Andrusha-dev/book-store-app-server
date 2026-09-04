import { Prisma } from '../../../generated/prisma/client';

export const cartItemInclude = {
  product: true
} satisfies Prisma.CartItemInclude;
export type CartItemEntity = Prisma.CartItemGetPayload<{include: typeof cartItemInclude}>;

export const cartInclude = {
  items: {
    include: cartItemInclude
  }
} satisfies Prisma.CartInclude;
export type CartEntity = Prisma.CartGetPayload<{include: typeof cartInclude}>;
