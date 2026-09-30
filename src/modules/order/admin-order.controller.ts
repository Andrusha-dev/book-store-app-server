import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { OrderService } from './order.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import type { OrderResponseDto } from './dto/order-response.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { OrdersResponseDto } from './dto/orders-response.dto';


@Controller('admin/orders')
@Auth('ADMIN')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}
  //Генерація ТТН та зміна статусу замовлення на PROCESSING (при оплаті готівкою, після підтвердження менеджером)
  @Patch(':id/processing')
  @ApiErrors()
  async initProcessing(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.processOrder(id);
  }
  //Скасування замовлення (+ повернення коштів при оплаті карткою, якщо статус замовлення PROCESSING)
  @Patch(':id/cancel')
  @ApiErrors()
  async cancelOrder(
    @Param('id') id: string
  ): Promise<OrderResponseDto> {
    return await this.orderService.cancelOrder(id);
  }

  @Get()
  @ApiErrors()
  async findMany(
    @Query() queryDto: OrdersQueryDto,
  ): Promise<OrdersResponseDto> {
    return await this.orderService.findMany(queryDto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.findOne(id);
  }
}