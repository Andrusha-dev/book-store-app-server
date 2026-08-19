import type { CreateAuthorDto } from './dto/create-author.dto';
import { Prisma } from '../../generated/prisma/client';
import type { AuthorEntity } from './entities/author.entity';
import type { AuthorResponseDto } from './dto/author-response.dto';
import type { UsersQueryDto } from '../user/dto/users-query.dto';

export class AuthorMapper {
  static toCreateInput(dto: CreateAuthorDto): Prisma.AuthorCreateInput {
    const data: Prisma.AuthorCreateInput = {
      name: dto.name,
      imgUrl: dto.imgUrl,
      description: dto.description,
    }

    return data;
  }

  static toWhereInput(filters: Omit<UsersQueryDto, "sortBy" | "sortOrder" | "pageNo" | "pageSize">): Prisma.AuthorWhereInput {
    const where: Prisma.AuthorWhereInput = {
      name: filters.search
        ? {contains: filters.search, mode: 'insensitive'}
        : undefined
    }

    return where;
  }

  static toResponseDto(author: AuthorEntity): AuthorResponseDto {
    const responseDto: AuthorResponseDto = {
      id: author.id,
      name: author.name,
      imgUrl: author.imgUrl,
      description: author.description ?? undefined,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    }

    return responseDto;
  }
}