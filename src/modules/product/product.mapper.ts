import type {
  ProductBaseEntity,
  ProductEntity,
} from './entities/product.entity';
import type { ProductResponseDto } from './dto/product-response.dto';
import { CoverType, ProductStatus } from '../../generated/prisma/enums';
import type { CategoryResponseDto } from '../category/dto/category-response.dto';
import type { AuthorResponseDto } from '../author/dto/author-response.dto';
import type { PublisherResponseDto } from '../publisher/dto/publiser-response.dto';
import { AuthorMapper } from '../author/author.mapper';
import { PublisherMapper } from '../publisher/publisher.mapper';
import { CategoryMapper } from '../category/category.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from '../../generated/prisma/client';
import { ProductsQueryDto } from './dto/products-query.dto';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductBaseResponseDto } from './dto/product-base-response.dto';


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

  static toUpdateInput(dto: UpdateProductDto): Prisma.ProductUpdateInput {
    const data: Prisma.ProductUpdateInput = {
      name: dto.name,
      imgUrls: dto.imgUrls,
      price: dto.price,
      description: dto.description,
      quantity: dto.quantity,
      status: dto.status,
      widthMm: dto.widthMm,
      heightMm: dto.heightMm,
      depthMm: dto.depthMm,
      weightGrams: dto.weightGrams,
      isbn: dto.isbn,
      pages: dto.pages,
      coverType: dto.coverType,
      language: dto.language,
      categories: dto.categoryIds
        ? {
          set: dto.categoryIds.map((id) => ({ id })), //для перезапису всіх реляцій в many to many слід використовувати саме set а не connect
        }
        : undefined,
      author: dto.authorId
        ? {
          connect: { id: dto.authorId },
        }
        : undefined,
      publisher: dto.publisherId
        ? {
         connect: { id: dto.publisherId },
        }
        : undefined
    };

    return data;
  }

  //Маппер для публічного контракту queryDto
  static toWhereInputPublished(filters: Omit<ProductsQueryDto, "pageNo" | "pageSize" | "sortBy" | "sortOrder">): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED, //Вказуєм обовязковий статус PUBLISHED
      categories: filters.categoryId
        ? { some: {id: filters.categoryId} }
        : undefined,
      authorId: filters.authorId ?? undefined,
      publisherId: filters.publisherId ?? undefined,
      //для gte та lte prisma може приймати undefined
      price: { gte: filters.minPrice, lte: filters.maxPrice, },
      coverType: filters.coverTypes?.length
        ? { in: filters.coverTypes }
        : undefined,
      language: filters.languages?.length ?
        {in: filters.languages}
        : undefined,
      name: filters.search
        ? {contains: filters.search, mode: "insensitive"}
        : undefined
    }

    return where;
  }

  //Маппер для контракту queryDto для адміна
  static toWhereInputForAdmin(filters: Omit<AdminProductsQueryDto, "pageNo" | "pageSize" | "sortBy" | "sortOrder">): Prisma.ProductWhereInput {
    //Отримуєм where як при публічному запиті щоб не дублювати то самий код
    const where: Prisma.ProductWhereInput = ProductMapper.toWhereInputPublished(filters);
    //Змінюєм значення поля status на значення, передане фільтрами адміна
    where.status = filters.status ?? undefined;

    return where;
  }

  static toBaseResponseDto(product: ProductBaseEntity): ProductBaseResponseDto {
    const baseResponseDto: ProductBaseResponseDto = {
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
      publisherId: product.publisherId
    };

    return baseResponseDto;
  }

  static toResponseDto(product: ProductEntity): ProductResponseDto {
    const baseResponseDto: ProductBaseResponseDto = ProductMapper.toBaseResponseDto(product);

    const responseDto: ProductResponseDto = {
      ...baseResponseDto,
      categories: product.categories.map(category => CategoryMapper.toResponseDto(category)),
      author: AuthorMapper.toResponseDto(product.author),
      publisher: PublisherMapper.toResponseDto(product.publisher)
    }

    return responseDto;
  }
}