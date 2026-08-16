import type { Product } from '../../../generated/prisma/client';
import { Prisma } from '../../../generated/prisma/client';

export type ProductBase = Product;

export const productInclude = {
  mainCategory: true,
  categories: true,
  author: true,
  publisher: true
} satisfies Prisma.ProductInclude

export type ProductEntity = Prisma.ProductGetPayload<{include: typeof productInclude}>;
