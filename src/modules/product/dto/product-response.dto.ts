import type { CoverType, ProductStatus } from '../../../generated/prisma/enums';
import type { CategoryResponseDto } from '../../category/dto/category-response.dto';
import type { AuthorResponseDto } from '../../author/dto/author-response.dto';
import type { PublisherResponseDto } from '../../publisher/dto/publiser-response.dto';

export class ProductResponseDto {
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
  categories: CategoryResponseDto[];
  author: AuthorResponseDto;
  publisher: PublisherResponseDto;
}