import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';
import { type DeliveryMethod, Prisma } from '../../generated/prisma/client';
import { DeliveryMapper } from './delivery.mapper';
import { DeliveryEntity } from './entities/delivery.entity';
import type { CreateTrackingNumberDto } from './dto/create-tracking-number.dto';
import {
  NovaPoshtaProvider,
  type TrackingStatusItem,
} from './infrastructure/nova-poshta.provider';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { TrackingStatusItemResponseDto } from './dto/tracking-status-item-response.dto';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly novaPoshtaProvider: NovaPoshtaProvider,
    private readonly logger: Logger,
  ) {}

  async create(
    orderId: string,
    dto: CreateDeliveryDto,
    tx?: Prisma.TransactionClient,
  ): Promise<DeliveryResponseDto> {
    const dbClient = tx ?? this.prismaService;

    const data: Prisma.DeliveryCreateInput =
      DeliveryMapper.toDeliveryCreateInput(orderId, dto);

    const delivery: DeliveryEntity = await dbClient.delivery.create({ data });
    this.logger.log(
      `Оплату з ID ${delivery.id} успішно створено для замовлення з ID ${orderId}`,
    );

    return DeliveryMapper.toResponseDto(delivery);
  }

  //Створює ТТН через API Нової Пошти
  async createTrackingNumber(dto: CreateTrackingNumberDto): Promise<string> {
    const createTrackingRequest = DeliveryMapper.toCreateTrackingRequest(dto);

    const { IntDocNumber } = await this.novaPoshtaProvider.createTracking(createTrackingRequest);

    return IntDocNumber;
  }

  //Встановлює номер ТТН в trackingNumber доставки
  async updateTrackingNumberByOrderId(orderId: string, trackingNumber: string, tx?: Prisma.TransactionClient): Promise<DeliveryResponseDto> {
    const dbClient = tx ?? this.prismaService;

    /*
    const createTrackingRequest = DeliveryMapper.toCreateTrackingRequest(dto);

    const { IntDocNumber } = await this.novaPoshtaProvider.createTracking(
      createTrackingRequest,
    );
     */

    const delivery: DeliveryEntity = await dbClient.delivery.update({
      where: { orderId},
      data: { trackingNumber},
    });

    return DeliveryMapper.toResponseDto(delivery);
  }

  //Метод для перевірки відповідності ваги та довжини замовлення для доставки в поштомат НП
  verifyOrderMetrics(
    deliveryMethod: DeliveryMethod,
    heightMm: number,
    weightGrams: number,
  ): void {
    //Якщо метод доставки у відділення то будь-які метрики підходять
    if (deliveryMethod === 'WAREHOUSE') {
      return;
    }

    const heightSm = heightMm / 10;
    const weightKGrams = weightGrams / 1000;

    const canSend = this.novaPoshtaProvider.canSendToPostomat(
      weightKGrams,
      heightSm,
    );
    if (!canSend) {
      throw new BadRequestException(
        `Метрики замовлення перевищують допустимі значення для методу доставки ${deliveryMethod}`,
      );
    }
  }

  //Повертає обєкти, що містить номер ТТН та статус цієї ттн (який визначений новою поштою)
  async getTrackingStatusItems(trackingNumbers: string[]): Promise<TrackingStatusItemResponseDto[]> {
    const items: TrackingStatusItem[] = await this.novaPoshtaProvider.getTrackingStatusItems(trackingNumbers);

    const responseDto: TrackingStatusItemResponseDto[] = items.map((item) =>
      DeliveryMapper.toTrackingStatusItemResponseDto(item),
    );

    return responseDto;
  }

  //Пошук доставки за номером ТТН
  async findOneByTrackingNumber(trackingNumber: string): Promise<DeliveryResponseDto> {
    const delivery: DeliveryEntity =
      await this.prismaService.delivery.findFirstOrThrow({
        where: { trackingNumber },
      });

    return DeliveryMapper.toResponseDto(delivery);
  }
}
