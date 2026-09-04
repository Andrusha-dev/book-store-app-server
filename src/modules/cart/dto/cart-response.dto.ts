import type { CartItemResponseDto } from './cart-Item-response.dto';

export class CartResponseDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: string;
  readonly items: CartItemResponseDto[];
}