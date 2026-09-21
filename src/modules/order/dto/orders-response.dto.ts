import type { OrderResponseDto } from './order-response.dto';
import type { PageMetaDto } from '../../../common/dto/page-meta.dto';


export class OrdersResponseDto {
  readonly data: OrderResponseDto[];
  readonly meta: PageMetaDto;
}