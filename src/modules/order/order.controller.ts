import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersResponseDto } from './dto/orders-response.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth()
  @ApiErrors()
  async checkout(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: ITokenPayload
  ): Promise<CheckoutResponseDto> {
    return await this.orderService.checkout(user.id, dto);
  }

  @Get()
  @Auth()
  @ApiErrors()
  async findMany(
    @Query() queryDto: OrdersQueryDto,
    @CurrentUser() user: ITokenPayload
  ): Promise<OrdersResponseDto> {
    return await this.orderService.findMany(queryDto, user.id);
  }

  @Get(':id')
  @Auth()
  @ApiErrors()
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: ITokenPayload
  ): Promise<OrderResponseDto> {
    return await this.orderService.findOne(id, user.id);
  }

  /*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }
   */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
