import { Injectable } from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { PublisherResponseDto } from './dto/publiser-response.dto';
import { PublisherEntity } from './entities/publisher.entity';
import { Prisma } from '../../generated/prisma/client';
import { PublisherMapper } from './publisher.mapper';
import { PublishersQueryDto } from './dto/publishers-query.dto';
import { PublishersResponseDto } from './dto/publishers-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

@Injectable()
export class PublisherService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreatePublisherDto): Promise<PublisherResponseDto> {
    const data: Prisma.PublisherCreateInput = PublisherMapper.toCreateInput(dto);

    const publisher: PublisherEntity = await this.prismaService.publisher.create({data});
    this.logger.log(`Видавництво з id ${publisher.id} успішно створено`)

    return PublisherMapper.toResponseDto(publisher);
  }

  async findMany(queryDto: PublishersQueryDto): Promise<PublishersResponseDto> {
    const {sortBy, sortOrder, pageNo, pageSize, ...filters} = queryDto;

    const where = PublisherMapper.toWhereInput(filters);
    const [publishers, totalElements] = await Promise.all([
      this.prismaService.publisher.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: pageNo * pageSize
      }),
      this.prismaService.publisher.count({where})
    ]);

    const data: PublisherResponseDto[] = publishers.map(publisher => PublisherMapper.toResponseDto(publisher));
    const meta: PageMetaDto = new PageMetaDto(pageNo, pageSize, totalElements);

    return {data, meta}
  }

  findOne(id: number) {
    return `This action returns a #${id} publisher`;
  }

  update(id: number, updatePublisherDto: UpdatePublisherDto) {
    return `This action updates a #${id} publisher`;
  }

  remove(id: number) {
    return `This action removes a #${id} publisher`;
  }
}
