import { Injectable } from '@nestjs/common';
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


@Injectable()
export class AuthorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const data: Prisma.AuthorCreateInput = AuthorMapper.toCreateInput(dto);
    const author: AuthorEntity = await this.prismaService.author.create({ data });
    this.logger.log("Автора успішно створено");
    const responseDto: AuthorResponseDto = AuthorMapper.toResponseDto(author);
    return responseDto;
  }

  async findMany(queryDto: AuthorsQueryDto): Promise<AuthorsResponseDto> {
    const {pageNo, pageSize, sortBy, sortOrder, ...filters} = queryDto;

    this.logger.log("sdjkfghskdjgfhkshgsk sskjdh skdh  sdjf sjkhf", queryDto);

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

    const responseDto: AuthorsResponseDto = { data, meta }

    return responseDto;
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
