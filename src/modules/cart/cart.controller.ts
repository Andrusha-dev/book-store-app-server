import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

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
    return await this.cartService.createItemOrIncreaseQuantity(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartItemDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
