import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ProductService } from '../product/product.service';

@Injectable()
export class PublisherService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
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

  async findOne(id: string): Promise<PublisherResponseDto> {
    const publisher: PublisherEntity | null = await this.prismaService.publisher.findUnique({where: {id}});

    if(!publisher) {
      throw new NotFoundException(`Видавництво з id ${id} не знайдено`);
    }

    return PublisherMapper.toResponseDto(publisher);
  }

  async update(id: string, dto: UpdatePublisherDto): Promise<PublisherResponseDto> {
    const data = PublisherMapper.toUpdateInput(dto);

    const publisher: PublisherEntity = await this.prismaService.publisher.update({
      where: {id},
      data
    });
    this.logger.log(`Видавництво з id ${id} успішно оновлено`);

    return PublisherMapper.toResponseDto(publisher);
  }

  async remove(id: string): Promise<PublisherResponseDto> {
    const products = await this.productService.findProductsByPublisherId(id);

    //Перевіряєм чи є книги цього видавництва, які мають статус, відмінний від DRAFT
    const notRemovedProducts = products.filter(product => product.status !== "DRAFT");

    //Якщо є, то видаляти таке видавництво не можна
    if(notRemovedProducts.length) {
      throw new BadRequestException(`Не можливо видалити видавництво з id ${id}, оскільки воно має опубліковані товари`);
    }

    const publisher: PublisherEntity = await this.prismaService.publisher.delete({ where: {id} });
    this.logger.log(`Видавництво з id ${id} успішно видалено`);

    return PublisherMapper.toResponseDto(publisher);
  }
}
