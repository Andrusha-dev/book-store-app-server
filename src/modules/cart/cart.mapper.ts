import type { CartEntity, CartItemEntity } from './entities/cart.entity';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-Item-response.dto';
import { ProductMapper } from '../product/product.mapper';
import type { CreateCartItemDto } from './dto/create-cart-item.dto';
import { Prisma } from '../../generated/prisma/client';
import type { UpdateCartItemDto } from './dto/update-cart-item.dto';


export class CartMapper {
  //Метод для маппінга в CartUpdateInput, через який створюється CartItem
  static toCartItemCreateInput(cartId: string, dto: CreateCartItemDto): Prisma.CartItemCreateInput {
    const data: Prisma.CartItemCreateInput = {
          quantity: dto.quantity,
          product: {
            connect: {id: dto.productId}
          },
          cart: {
            connect: {id: cartId}
          }
    };

    return data;
    /*
    const data: Prisma.CartUpdateInput = {
      items: {
        upsert: {
          //Для перевірки унікальності CartItem нам потрібен саме обєкт cartId_productId, який генерує prisma, відповідно до схеми
          where: { cartId_productId: { cartId: cartId, productId: dto.productId }},
          update: { quantity: { increment: dto.quantity } },
          create: { quantity: dto.quantity, productId: dto.productId }, // cartId Prisma підставить сама
        },
      },
    }
     */


  }

  //Метод для маппінга в CartUpdateInput, через який змінюється
  static toCartItemUpdateInput(dto: UpdateCartItemDto): Prisma.CartItemUpdateInput {
    const data: Prisma.CartItemUpdateInput = {
      quantity: dto.quantity
    };

    return data;
  }

  static toCartResponseDto(cart: CartEntity): CartResponseDto {
    const responseDto: CartResponseDto = {
      id: cart.id,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      userId: cart.userId,
      items: cart.items.map((cartItem) => CartMapper.toCartItemResponseDto(cartItem))
    };

    return responseDto;
  }

  private static toCartItemResponseDto(cartItem: CartItemEntity): CartItemResponseDto {
    const responseDto: CartItemResponseDto = {
      id: cartItem.id,
      quantity: cartItem.quantity,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
      cartId: cartItem.cartId,
      productId: cartItem.productId,
      product: ProductMapper.toBaseResponseDto(cartItem.product),
    };

    return responseDto;
  }
}