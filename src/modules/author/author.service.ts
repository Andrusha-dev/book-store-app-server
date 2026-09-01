import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { Prisma } from '../../generated/prisma/client';
import { AuthorMapper } from './author.mapper';
import type { AuthorEntity } from './entities/author.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { AuthorsQueryDto } from './dto/authors-query.dto';
import { AuthorsResponseDto } from './dto/authors-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { ProductService } from '../product/product.service';


@Injectable()
export class AuthorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const data: Prisma.AuthorCreateInput = AuthorMapper.toCreateInput(dto);
    const author: AuthorEntity = await this.prismaService.author.create({ data });
    this.logger.log(`Автора з id ${author.id} успішно створено`);
    const responseDto: AuthorResponseDto = AuthorMapper.toResponseDto(author);
    return responseDto;
  }

  async findMany(queryDto: AuthorsQueryDto): Promise<AuthorsResponseDto> {
    const {pageNo, pageSize, sortBy, sortOrder, ...filters} = queryDto;

    const where: Prisma.AuthorWhereInput = AuthorMapper.toWhereInput(filters);
    const [authorEntities, totalElements] = await Promise.all([
      this.prismaService.author.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder
        },
        take: pageSize,
        skip: pageNo * pageSize
      }),
      this.prismaService.author.count({where})
    ]);

    const data: AuthorResponseDto[] = authorEntities.map(author => AuthorMapper.toResponseDto(author));
    const meta: PageMetaDto = new PageMetaDto(pageNo, pageSize, totalElements);

    return { data, meta }
  }

  async findOne(id: string): Promise<AuthorResponseDto> {
    const author: AuthorEntity | null = await this.prismaService.author.findUnique({
      where: {id}
    });

    if(!author) {
      throw new NotFoundException(`Автора з id ${id} не знайдено`);
    }

    return AuthorMapper.toResponseDto(author)
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<AuthorResponseDto> {
    const data: Prisma.AuthorUpdateInput = AuthorMapper.toUpdateInput(updateAuthorDto);
    const updatedAuthor: AuthorEntity = await this.prismaService.author.update({
      where: {id},
      data
    });
    this.logger.log(`Автора з id ${updatedAuthor.id} успішно оновлено`)

    return AuthorMapper.toResponseDto(updatedAuthor);
  }

  //Метод для видалення автора, якщо книга не була виставлена на продаж (мала виключно статус DRAFT), інакше автора видаляти не можна
  async remove(id: string): Promise<AuthorResponseDto> {
    const products = await this.productService.findManyByAuthorId(id);

    //Перевіряєм чи є книги цього автора, які мають статус, відмінний від DRAFT
    const notRemovedProducts = products.filter(product => product.status !== 'DRAFT');

    //Якщо є, то видаляти цього автора не можна
    if (notRemovedProducts.length) {
      throw new BadRequestException(`Неможливо видалити автора з id ${id}, оскільки в нього є опубліковані товари`,);
    }

    const deletedAuthor: AuthorEntity = await this.prismaService.author.delete({ where: { id }});
    this.logger.log(`Автора з успішно id ${deletedAuthor.id} успішно видалено`);

    return AuthorMapper.toResponseDto(deletedAuthor);
  }
}
