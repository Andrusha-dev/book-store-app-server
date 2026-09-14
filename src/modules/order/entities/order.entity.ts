import {
  type Order,
  Prisma,
} from '../../../generated/prisma/client';


export const orderItemInclude = {
  product: true
} satisfies Prisma.OrderItemInclude;
export type OrderItemEntity = Prisma.OrderItemGetPayload<{include: typeof orderItemInclude}>

export type OrderBaseEntity = Order;

export const orderInclude = {
  payments: true,
  delivery: true,
  items: {
    include: orderItemInclude
  }
} satisfies Prisma.OrderInclude;
export type OrderEntity = Prisma.OrderGetPayload<{include: typeof orderInclude}>
