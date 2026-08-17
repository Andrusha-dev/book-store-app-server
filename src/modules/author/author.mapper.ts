import type { CreateAuthorDto } from './dto/create-author.dto';
import { Prisma } from '../../generated/prisma/client';
import type { AuthorEntity } from './entities/author.entity';
import type { AuthorResponseDto } from './dto/author-response.dto';

export class AuthorMapper {
  static toCreateInput(dto: CreateAuthorDto): Prisma.AuthorCreateInput {
    const data: Prisma.AuthorCreateInput = {
      name: dto.name,
      imgUrl: dto.imgUrl,
      description: dto.description,
    }

    return data;
  }

  static toAuthorResponseDto(author: AuthorEntity): AuthorResponseDto {
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