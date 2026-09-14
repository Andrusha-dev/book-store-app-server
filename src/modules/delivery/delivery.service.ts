import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import type { CreateDeliveryInput } from './delivery.contracts';
import type { DeliveryResponseDto } from './dto/delivery-response.dto';
import { Prisma } from '../../generated/prisma/client';
import { DeliveryMapper } from './delivery.mapper';
import { DeliveryEntity } from './entities/delivery.entity';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

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
