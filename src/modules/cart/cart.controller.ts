import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Auth()
  @ApiErrors()
  async findMyCart(@CurrentUser() user: ITokenPayload): Promise<CartResponseDto> {
    return await this.cartService.findOneByUserId(user.id);
  }

  @Post('items')
  @Auth()
  @ApiErrors()
  async createItem(
    @Body() dto: CreateCartItemDto,
    @CurrentUser() user: ITokenPayload
  ): Promise<CartResponseDto> {
    return await this.cartService.createItem(user.id, dto);
  }

  @Patch('items/:id')
  @Auth()
  @ApiErrors()
  async updateItemQuantity(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: ITokenPayload
  ): Promise<CartResponseDto> {
    return await this.cartService.updateItemQuantity(user.id, id, dto);
  }

  @Delete('items/:id')
  @Auth()
  @ApiErrors()
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: ITokenPayload
  ): Promise<CartResponseDto> {
    return await this.cartService.removeItem(user.id, id);
  }

  @Delete('items')
  @Auth()
  @ApiErrors()
  async clear(@CurrentUser() user: ITokenPayload): Promise<CartResponseDto> {
    return await this.cartService.clear(user.id);
  }

  @Post('merge')
  @Auth()
  @ApiErrors()
  async merge(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: MergeCartDto
  ): Promise<CartResponseDto> {
    return await this.cartService.merge(user.id, dto);
  }
}
