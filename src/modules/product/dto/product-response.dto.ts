import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { AuthorResponseDto } from '../../author/dto/author-response.dto';
import { PublisherResponseDto } from '../../publisher/dto/publiser-response.dto';
import { ProductBaseResponseDto } from './product-base-response.dto';

//responseDto з реляціями
export class ProductResponseDto extends ProductBaseResponseDto {
  categories: CategoryResponseDto[];
  author: AuthorResponseDto;
  publisher: PublisherResponseDto;
}