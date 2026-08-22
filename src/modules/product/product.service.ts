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

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
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

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
