import type { ProductEntity } from './entities/product.entity';
import type { ProductResponseDto } from './dto/product-response.dto';
import type { CoverType, ProductStatus } from '../../generated/prisma/enums';
import type { CategoryResponseDto } from '../category/dto/category-response.dto';
import type { AuthorResponseDto } from '../author/dto/author-response.dto';
import type { PublisherResponseDto } from '../publisher/dto/publiser-response.dto';
import { AuthorMapper } from '../author/author.mapper';
import { PublisherMapper } from '../publisher/publisher.mapper';
import { CategoryMapper } from '../category/category.mapper';
import type { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from '../../generated/prisma/client';

export class ProductMapper {
  static toCreateInput(dto: CreateProductDto): Prisma.ProductCreateInput {
    const data: Prisma.ProductCreateInput = {
      name: dto.name,
      imgUrls: dto.imgUrls,
      price: dto.price,
      description: dto.description,
      quantity: dto.quantity,
      widthMm: dto.widthMm,
      heightMm: dto.heightMm,
      depthMm: dto.depthMm,
      weightGrams: dto.weightGrams,
      isbn: dto.isbn,
      pages: dto.pages,
      coverType: dto.coverType,
      language: dto.language,
      categories: {
        connect: dto.categoryIds.map(id => ({id}))
      },
      author: {
        connect: {id: dto.authorId}
      },
      publisher: {
        connect: {id: dto.publisherId}
      },
    }

    return data;
  }

  static toResponseDto(product: ProductEntity): ProductResponseDto {
    const responseDto: ProductResponseDto = {
      id: product.id,
      name: product.name,
      imgUrls: product.imgUrls,
      price: product.price.toNumber(),
      description: product.description ?? undefined,
      quantity: product.quantity,
      status: product.status,
      widthMm: product.widthMm,
      heightMm: product.heightMm,
      depthMm: product.depthMm,
      weightGrams: product.weightGrams,
      isbn: product.isbn,
      pages: product.pages,
      coverType: product.coverType,
      language: product.language,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      authorId: product.authorId,
      publisherId: product.publisherId,
      categories: product.categories.map(category => CategoryMapper.toResponseDto(category)),
      author: AuthorMapper.toResponseDto(product.author),
      publisher: PublisherMapper.toResponseDto(product.publisher)
    }

    return responseDto;
  }
}