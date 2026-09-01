import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { ProductsResponseDto } from './dto/products-response.dto';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiErrors()
  async findMany(@Query() queryDto: ProductsQueryDto): Promise<ProductsResponseDto> {
    return await this.productService.findManyPublished(queryDto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.findOnePublished(id);
  }
}
