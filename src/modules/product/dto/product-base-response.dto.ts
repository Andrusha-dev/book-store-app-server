import type { CoverType, ProductStatus } from '../../../generated/prisma/enums';

//responseDto без реляцій
export class ProductBaseResponseDto {
  id: string;
  name: string;
  imgUrls: string[];
  price: number;
  description?: string;
  quantity: number;
  status: ProductStatus;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  weightGrams: number;
  isbn: string;
  pages: number;
  coverType: CoverType;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  publisherId: string;
}