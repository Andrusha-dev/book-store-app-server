import type { CategoryEntity } from './entities/category.entity';
import type { CategoryResponseDto } from './dto/category-response.dto';
import type { CreateCategoryDto } from './dto/create-category.dto';
import { Prisma } from '../../generated/prisma/client';
import type { UpdateCategoryDto } from './dto/update-category.dto';

export class CategoryMapper {
  static toCreateInput(dto: CreateCategoryDto): Prisma.CategoryCreateInput {
    const data: Prisma.CategoryCreateInput = {
      name: dto.name
    }

    return data;
  }

  static toUpdateInput(dto: UpdateCategoryDto): Prisma.CategoryUpdateInput {
    const data: Prisma.CategoryUpdateInput = {
      name: dto.name ?? undefined,
    }

    return data;
  }

  static toResponseDto(category: CategoryEntity): CategoryResponseDto {
    const responseDto: CategoryResponseDto = {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }

    return responseDto;
  }
}