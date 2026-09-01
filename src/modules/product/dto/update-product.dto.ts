import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from '../../../generated/prisma/enums';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsEnum(ProductStatus)
  @IsOptional()
  readonly status?: ProductStatus;
}
