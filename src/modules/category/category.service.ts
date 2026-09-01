import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import type { CategoryEntity } from './entities/category.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { CategoryMapper } from './category.mapper';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const data = CategoryMapper.toCreateInput(dto);

    const category: CategoryEntity = await this.prismaService.category.create({data});
    this.logger.log(`Категорію з id ${category.id} успішно створено`)

    return CategoryMapper.toResponseDto(category);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories: CategoryEntity[] = await this.prismaService.category.findMany();

    return categories.map(category => CategoryMapper.toResponseDto(category));
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category: CategoryEntity | null = await this.prismaService.category.findUnique({
      where: {id}
    });

    if(!category) {
      throw new NotFoundException(`Категорії з id ${id} не знайдено`);
    }

    return CategoryMapper.toResponseDto(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const data = CategoryMapper.toUpdateInput(dto);

    const category: CategoryEntity = await this.prismaService.category.update({
      where: {id},
      data
    });
    this.logger.log(`Категорію з ID ${id} успішно оновлено`)

    return CategoryMapper.toResponseDto(category);
  }

  async remove(id: string): Promise<CategoryResponseDto> {
    const products: ProductResponseDto[] =
      await this.productService.findManyByCategoryId(id);

    //Перевіряєм чи є книги, які мають лише цю категорію
    const notRemovedProducts: ProductResponseDto[] = products.filter((product) => product.categories.length === 1);

    //Якщо є, то видаляти категорію не можна, бо товар має відноситись хоча б до однієї категорії
    if (notRemovedProducts.length) {
      throw new BadRequestException(`Неможливо видалити категорію з id ${id}, оскільки є товари, де дана категорія є єдиною`,);
    }

    const category: CategoryEntity = await this.prismaService.category.delete({ where: { id }});
    this.logger.log(`Категорію з id ${id} успішно видалено`);

    return CategoryMapper.toResponseDto(category);
  }
}
