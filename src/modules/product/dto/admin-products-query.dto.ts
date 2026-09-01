import { ProductsQueryDto } from './products-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from '../../../generated/prisma/enums';


export class AdminProductsQueryDto extends ProductsQueryDto {
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}