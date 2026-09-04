import type { ProductBaseResponseDto } from '../../product/dto/product-base-response.dto';


export class CartItemResponseDto {
  readonly id: string;
  readonly quantity: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly cartId: string;
  readonly productId: string;
  readonly product: ProductBaseResponseDto;
}