import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';
import { type DeliveryMethod, Prisma } from '../../generated/prisma/client';
import { DeliveryMapper } from './delivery.mapper';
import { DeliveryEntity } from './entities/delivery.entity';
import type { SetTrackingNumberDto } from './dto/set-tracking-number.dto';
import type { NovaPoshtaProvider } from './infrastructure/nova-poshta.provider';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly novaPoshtaProvider: NovaPoshtaProvider,
    private readonly logger: Logger
  ) {}

  async setTrackingNumber(dto: SetTrackingNumberDto): Promise<DeliveryResponseDto> {
    const createTrackingRequest = DeliveryMapper.toICreateTrackingRequest(dto);

    const {trackingNumber} = await this.novaPoshtaProvider.createTracking(createTrackingRequest);

    const delivery: DeliveryEntity = await this.prismaService.delivery.update({
      where: {
        orderId: dto.orderId
      },
      data: {
        trackingNumber
      }
    });

    return DeliveryMapper.toResponseDto(delivery);
  }

  //Метод для перевірки відповідності ваги та довжини замовлення для доставки в поштомат НП
  verifyOrderMetrics(deliveryMethod: DeliveryMethod, lengthMm: number, weightGrams: number): void {
    //Якщо метод доставки у відділення то будь-які метрики підходять
    if(deliveryMethod === 'WAREHOUSE') {
      return
    }

    const lengthSm = lengthMm / 10;
    const weightKGrams = weightGrams / 1000;

    const canSend = this.novaPoshtaProvider.canSendToPostomat(lengthSm, weightKGrams);
    if(!canSend) {
      throw new BadRequestException(`Метрики замовлення перевищують допустимі значення для методу доставки ${deliveryMethod}`)
    }
  }

  findAll() {
    return `This action returns all delivery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} delivery`;
  }

  /*
  update(id: number, updateDeliveryDto: UpdateDeliveryDto) {
    return `This action updates a #${id} delivery`;
  }
   */

  remove(id: number) {
    return `This action removes a #${id} delivery`;
  }
}
