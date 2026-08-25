import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { type ProductEntity, productInclude } from './entities/product.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { ProductMapper } from './product.mapper';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const data = ProductMapper.toCreateInput(dto);

    const product: ProductEntity = await this.prismaService.product.create({
      data,
      include: productInclude
    });

    return ProductMapper.toResponseDto(product);
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async findProductsByAuthorId(authorId: string): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany({
      where: {authorId},
      include: productInclude
    });

    return products.map(product => ProductMapper.toResponseDto(product));
  }

  async findProductsByPublisherId(publisherId: string): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany({
      where: { publisherId },
      include: productInclude
    });

    return products.map(product => ProductMapper.toResponseDto(product));
  }

  async findProductsByCategoryId(categoryId: string): Promise<ProductResponseDto[]> {
    const products: ProductEntity[] = await this.prismaService.product.findMany({
      where: {
        categories: {
          some: { id: categoryId }
        }
      },
      include: productInclude
    });

    return products.map(product => ProductMapper.toResponseDto(product));
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
