import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import {
  type ProductBaseEntity,
  type ProductEntity,
  productInclude,
} from './entities/product.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { ProductMapper } from './product.mapper';
import type { ProductsQueryDto } from './dto/products-query.dto';
import type { ProductsResponseDto } from './dto/products-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Prisma, ProductStatus } from '../../generated/prisma/client';
import type { AdminProductsQueryDto } from './dto/admin-products-query.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const data = ProductMapper.toCreateInput(dto);

    const product: ProductEntity = await this.prismaService.product.create({
      data,
      include: productInclude,
    });
    this.logger.log(`Товар ${product.name} з ID ${product.id} успішно створено`);

    return ProductMapper.toResponseDto(product);
  }

  //Публічний метод
  async findManyPublished(
    queryDto: ProductsQueryDto,
  ): Promise<ProductsResponseDto> {
    const { pageNo, pageSize, sortBy, sortOrder, ...filters } = queryDto;

    const where = ProductMapper.toWhereInputPublished(filters);

    const [products, totalElements] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: pageSize * pageNo,
        include: productInclude,
      }),
      this.prismaService.product.count({ where }),
    ]);

    const data = products.map((product) =>
      ProductMapper.toResponseDto(product),
    );
    const meta = new PageMetaDto(pageNo, pageSize, totalElements);

    return { data, meta };
  }

  //Метод для адмінів
  async findManyForAdmin(
    queryDto: AdminProductsQueryDto,
  ): Promise<ProductsResponseDto> {
    const { pageNo, pageSize, sortBy, sortOrder, ...filters } = queryDto;

    const where = ProductMapper.toWhereInputForAdmin(filters);

    const [products, totalElements] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: pageSize * pageNo,
        include: productInclude,
      }),
      this.prismaService.product.count({ where }),
    ]);

    const data = products.map((product) =>
      ProductMapper.toResponseDto(product),
    );
    const meta = new PageMetaDto(pageNo, pageSize, totalElements);

    return { data, meta };
  }

  //Публічний метод пошуку товару
  async findOnePublished(id: string): Promise<ProductResponseDto> {
    const product: ProductEntity | null = await this.prismaService.product.findFirst({
        where: {
          id,
          //обовязково вказуємо в фільтрі статус PUBLISHED
          status: ProductStatus.PUBLISHED,
        },
        include: productInclude,
      });

    if (!product) {
      throw new NotFoundException(`Товар з id ${id} не знайдено`);
    }

    return ProductMapper.toResponseDto(product);
  }

  //Метод пошуку товару для адмінів
  async findOneForAdmin(id: string): Promise<ProductResponseDto> {
    const product: ProductEntity | null = await this.prismaService.product.findUnique({
      where: {id},
      include: productInclude
    });

    if(!product) {
      throw new NotFoundException(`Товар з id ${id} не знайдено`);
    }

    return ProductMapper.toResponseDto(product);
  }

  async findManyByAuthorId(
    authorId: string,
  ): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany(
      {
        where: { authorId },
        include: productInclude,
      },
    );

    return products.map((product) => ProductMapper.toResponseDto(product));
  }

  async findManyByPublisherId(
    publisherId: string,
  ): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany(
      {
        where: { publisherId },
        include: productInclude,
      },
    );

    return products.map((product) => ProductMapper.toResponseDto(product));
  }

  async findManyByCategoryId(
    categoryId: string,
  ): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany(
      {
        where: {
          categories: {
            some: { id: categoryId },
          },
        },
        include: productInclude,
      },
    );

    return products.map((product) => ProductMapper.toResponseDto(product));
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const data = ProductMapper.toUpdateInput(dto);

    const product: ProductEntity = await this.prismaService.product.update({
      where: {id},
      data,
      include: productInclude
    });
    this.logger.log(`Товар ${product.name} з ID ${product.id} успішно оновлено`)

    return ProductMapper.toResponseDto(product);
  }

  async remove(id: string): Promise<ProductResponseDto> {
    const product: ProductEntity = await this.prismaService.product.delete({
      where: {id},
      include: productInclude
    });

    return ProductMapper.toResponseDto(product);
  }

  //Метод для зменшення кількості товару (наприклад, при оформленні замолення)
  async decreaseQuantity(id: string, quantity: number, tx?: Prisma.TransactionClient): Promise<ProductResponseDto> {
    const dbClient = tx ?? this.prismaService;

    const product: ProductBaseEntity = await dbClient.product.findUniqueOrThrow({ where: {id} });

    if(product.quantity < quantity) {
      throw new BadRequestException(`В замовленні вказано ${quantity} шт. товару з id ${id}. Але в наявності є ${product.quantity} шт.`,);
    }

    const updatedProduct: ProductEntity = await dbClient.product.update({
      where: {id},
      data: {quantity: {decrement: quantity}},
      include: productInclude
    });

    return ProductMapper.toResponseDto(updatedProduct);
  }

  //Метод для збільшення кількості товару (наприклад, при скасуванні замовлення)
  async increaseQuantity(id: string, quantity: number, tx?: Prisma.TransactionClient): Promise<ProductResponseDto> {
    const dbClient = tx ?? this.prismaService;

    const updatedProduct: ProductEntity = await dbClient.product.update({
      where: {id},
      data: {
        quantity: {increment: quantity}
      },
      include: productInclude
    });

    return ProductMapper.toResponseDto(updatedProduct);
  }
}
