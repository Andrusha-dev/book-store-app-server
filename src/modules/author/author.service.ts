import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { Prisma } from '../../generated/prisma/client';
import { AuthorMapper } from './author.mapper';
import type { AuthorEntity } from './entities/author.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { Logger } from 'nestjs-pino';


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
    const responseDto: AuthorResponseDto = AuthorMapper.toAuthorResponseDto(author);
    return responseDto;
  }

  findAll() {
    return `This action returns all author`;
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
