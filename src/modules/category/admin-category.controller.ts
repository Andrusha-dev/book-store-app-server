import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { CategoryService } from './category.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@Auth('ADMIN')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiErrors()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.categoryService.create(dto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.remove(id);
  }
}