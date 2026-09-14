import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { OrderResponseDto } from './dto/order-response.dto';
import { Prisma } from '../../generated/prisma/client';
import type { OrderCreateInput } from '../../generated/prisma/models/Order';
import { OrderMapper } from './order.mapper';
import { CartService } from '../cart/cart.service';
import { DeliveryService } from '../delivery/delivery.service';
import {
  type OrderEntity,
  orderInclude,
} from './entities/order.entity';
import { ProductService } from '../product/product.service';
import { PaymentService } from '../payment/payment.service';
import type { InvoiceResponseDto } from '../payment/dto/invoice-response.dto';
import type { CheckoutResponseDto } from './dto/checkout-response.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
    private readonly logger: Logger
  ) {}

  async checkout(userId: string, dto: CreateOrderDto): Promise<CheckoutResponseDto> {
    const createdOrder: OrderEntity = await this.prismaService.$transaction(async (tx) => {
      //Створюємо замовлення з доставкою
      const order: OrderEntity = await this.create(userId, dto, tx);

      //Списуємо товар
      for (const item of order.items) {
        await this.productService.decreaseQuantity(item.productId, item.quantity, tx);
      }

      return order;
    });

    //Очищуємо кошик. Не повинен бути в одній транзакції зі створенням order, бо очистка кошика це не критична транзакція
    await this.cartService.clear(userId);

    let paymentUrl: string | null = null;

    //Створюємо інвойс та payment. Вони не повинні бути в одній транзакції з order, бо Order має створитись, незалежно від того чи вдалось створити інвойс, чи ні (монобанк впав)
    if (dto.paymentMethod === 'CARD') {
      const invoiceResponseDto: InvoiceResponseDto = await this.paymentService.initializePayment(createdOrder.id, Number(createdOrder.amount));
      paymentUrl = invoiceResponseDto.paymentUrl;
    }

    return OrderMapper.toCheckoutResponseDto(createdOrder, paymentUrl);
  }


  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async create(userId: string, dto: CreateOrderDto, tx: Prisma.TransactionClient): Promise<OrderEntity> {
    const cart = await this.cartService.findOneByUserId(userId, tx);

    //Створюємо Prisma.OrderItemCrerateWithoutOrderInput[] на основі кошика
    const items = cart.items.map((item) =>
      OrderMapper.toPrismaOrderItemCreateInput(item)
    );

    //Підраховуємо загальну суму замовлення
    const amount = items.reduce((acc, item) => {
      return acc + Number(item.price);
    }, 0);

    const delivery = OrderMapper.toPrismaDeliveryCreateInput(dto);

    //Створюємо Prisma.OrderCreateInput
    const data: OrderCreateInput = OrderMapper.toPrismaOrderCreateInput(userId, amount, dto.paymentMethod, items, delivery);

    //Створюємо замовлення
    const order: OrderEntity = await tx.order.create({
      data,
      include: orderInclude
    });
    this.logger.log(`Замовлення з id ${order.id} успішно створено`);

    return order;
  }
}
