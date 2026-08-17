import type { Product } from '../../../generated/prisma/client';
import { Prisma } from '../../../generated/prisma/client';


export const productInclude = {
  categories: true,
  author: true,
  publisher: true
} satisfies Prisma.ProductInclude

export type ProductEntity = Prisma.ProductGetPayload<{include: typeof productInclude}>;
