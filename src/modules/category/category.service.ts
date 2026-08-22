import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import type { CategoryEntity } from './entities/category.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { CategoryMapper } from './category.mapper';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const data = CategoryMapper.toCreateInput(dto);

    const category: CategoryEntity = await this.prismaService.category.create({data});
    this.logger.log(`Категорію з id ${category.id} успішно створено`)

    return CategoryMapper.toResponseDto(category);
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
