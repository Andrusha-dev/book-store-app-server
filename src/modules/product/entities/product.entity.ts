import { Prisma, type Product } from '../../../generated/prisma/client';

//Сутність без реляцій
export type ProductBaseEntity = Product;

export const productInclude = {
  categories: true,
  author: true,
  publisher: true
} satisfies Prisma.ProductInclude
//Сутність з реляціями
export type ProductEntity = Prisma.ProductGetPayload<{include: typeof productInclude}>;
