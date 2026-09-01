import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import { ProductsResponseDto } from './dto/products-response.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('admin/products')
@Auth('ADMIN')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiErrors()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return await this.productService.create(dto);
  }

  @Get()
  @ApiErrors()
  async findMany(
    @Query() queryDto: AdminProductsQueryDto,
  ): Promise<ProductsResponseDto> {
    return await this.productService.findManyForAdmin(queryDto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.findOneForAdmin(id);
  }

  @Patch(':id')
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return await this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.remove(id);
  }
}