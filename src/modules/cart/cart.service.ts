import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from '../../core/database/prisma.service';
import type { CartResponseDto } from './dto/cart-response.dto';
import {
  type CartEntity,
  cartInclude,
  type CartItemEntity,
  cartItemInclude,
} from './entities/cart.entity';
import { CartMapper } from './cart.mapper';
import { Prisma } from '../../generated/prisma/client';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { ProductService } from '../product/product.service';
import { MergeCartDto } from './dto/merge-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService
  ) {}

  async findOneByUserId(userId: string): Promise<CartResponseDto> {
    const cart: CartEntity | null = await this.prismaService.cart.findUnique({
      where: {userId},
      include: cartInclude
    });

    if(!cart) {
      throw new NotFoundException(`Кошика з userId ${userId} не знайдено`);
    }

    return CartMapper.toCartResponseDto(cart);
  }

  //Метод, який створює новий CartItem, або повертає поточний кошик, якщо cartItem з таким productId вже в кошику
  async createItem(userId: string, dto: CreateCartItemDto): Promise<CartResponseDto> {
    const cart: CartEntity = await this.prismaService.cart.findUniqueOrThrow({
      where: {userId},
      include: cartInclude
    });

    //Перевіряєм чи цей товар вже знаходиться в кошику
    const cartItem: CartItemEntity | undefined = cart.items.find(item => item.productId === dto.productId);
    //Якщо так то нічого не змінюємо і повертаємо поточний кошик
    if(cartItem) {
      return CartMapper.toCartResponseDto(cart);
    }

    const product = await this.productService.findOnePublished(dto.productId);
    if(product.quantity < dto.quantity) {
      throw new BadRequestException(`Доступна кількість товару: ${product.quantity} шт. Ви намагаєтесь додати: ${dto.quantity} шт.`);
    }

    const data = CartMapper.toCartItemCreateInput(cart.id, dto);
    await this.prismaService.cartItem.create({ data })

    const updatedCart: CartEntity = await this.prismaService.cart.findUniqueOrThrow({
      where: {userId},
      include: cartInclude
    });

    return CartMapper.toCartResponseDto(updatedCart);
  }

  async updateItemQuantity(userId: string, cartItemId: string, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    const cart: CartEntity = await this.prismaService.cart.findUniqueOrThrow({
      where: {userId},
      include: cartInclude
    });

    //Перевіряєм чи необхідний CartItem взагалі існує
    const cartItem: CartItemEntity | undefined = cart.items.find(item => item.id === cartItemId);
    if(!cartItem) {
      throw new NotFoundException(`В кошику відсутній запис з id ${cartItemId}`)
    }

    const product = await this.productService.findOnePublished(cartItem.productId);
    if(product.quantity < dto.quantity) {
      throw new BadRequestException(`Доступна кількість товару: ${product.quantity} шт. Ви намагаєтесь додати: ${dto.quantity} шт.`,);
    }

    const data = CartMapper.toCartItemUpdateInput(dto);
    await this.prismaService.cartItem.update({
      where: { id: cartItemId },
      data,
    });

    const updatedCart: CartEntity = await this.prismaService.cart.findUniqueOrThrow({
      where: {userId},
      include: cartInclude
    });

    return CartMapper.toCartResponseDto(updatedCart);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartResponseDto> {
    const cart: CartEntity = await this.prismaService.cart.findUniqueOrThrow({
      where: { userId },
      include: cartInclude,
    });

    const cartItem: CartItemEntity | undefined = cart.items.find(item => item.id === cartItemId);
    if(!cartItem) {
      throw new NotFoundException(`В кошику відсутній запис з id ${cartItemId}`);
    }

    //Видаляємо CartItem через вкладеність, виконавши лише один запит
    const updatedCart: CartEntity = await this.prismaService.cart.update({
      where: {userId},
      data: {
        items: {
          delete: {id: cartItemId}
        }
      },
      include: cartInclude
    });

    return CartMapper.toCartResponseDto(updatedCart);
  }

  //Метод для очистки кошика
  async clear(userId: string): Promise<CartResponseDto> {
    //Очищуємо Cart через вкладеність, виконавши лише один запит
    const updatedCart: CartEntity = await this.prismaService.cart.update({
      where: {userId},
      data: {
        items: {
          deleteMany: {}
        }
      },
      include: cartInclude
    });

    return CartMapper.toCartResponseDto(updatedCart);
  }

  //Метод злиття локального кошика клієнта з кошиком в бд
  async merge(userId: string, dto: MergeCartDto): Promise<CartResponseDto> {
    /*
    for (const item of dto.items) {
      await this.createItem(userId, item);
    }
    */
    //Якщо товар вже знаходиться в кошику бд, то він не буде змінений
    await Promise.all(dto.items.map(item => this.createItem(userId, item)));

    return await this.findOneByUserId(userId);
  }
}
