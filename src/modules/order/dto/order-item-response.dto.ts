import type { ProductResponseDto } from '../../product/dto/product-response.dto';
import type { ProductBaseResponseDto } from '../../product/dto/product-base-response.dto';


export class OrderItemResponseDto {
  readonly id: string;
  readonly quantity: number;
  readonly price: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly orderId: string;
  readonly productId: string;
  readonly product: ProductBaseResponseDto;
}