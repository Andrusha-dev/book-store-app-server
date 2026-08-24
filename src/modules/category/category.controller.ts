import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import type { CategoryResponseDto } from './dto/category-response.dto';


@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth("ADMIN")
  @ApiErrors()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.categoryService.create(dto);
  }

  @Get()
  @ApiErrors()
  async findAll(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.remove(id);
  }
}
