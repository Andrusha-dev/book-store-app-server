import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import type { ProductResponseDto } from './product-response.dto';


export class ProductsResponseDto {
  readonly data: ProductResponseDto[];
  readonly meta: PageMetaDto;
}