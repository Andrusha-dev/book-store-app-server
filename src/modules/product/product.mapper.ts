import type { ProductEntity } from './entities/product.entity';
import type { ProductResponseDto } from './dto/product-response.dto';
import type { CoverType, ProductStatus } from '../../generated/prisma/enums';
import type { CategoryResponseDto } from '../category/dto/category-response.dto';
import type { AuthorResponseDto } from '../author/dto/author-response.dto';
import type { PublisherResponseDto } from '../publisher/dto/publiser-response.dto';
import { AuthorMapper } from '../author/author.mapper';
import { PublisherMapper } from '../publisher/publisher.mapper';
import { CategoryMapper } from '../category/category.mapper';

export class ProductMapper {
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