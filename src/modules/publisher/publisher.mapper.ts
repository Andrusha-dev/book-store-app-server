import type { PublisherEntity } from './entities/publisher.entity';
import { PublisherResponseDto } from './dto/publiser-response.dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { Prisma } from '../../generated/prisma/client';
import type { PublishersQueryDto } from './dto/publishers-query.dto';
import type { UpdatePublisherDto } from './dto/update-publisher.dto';

export class PublisherMapper {
  static toCreateInput(dto: CreatePublisherDto): Prisma.PublisherCreateInput {
    const data: Prisma.PublisherCreateInput = {
      name: dto.name
    }

    return data;
  }

  static toUpdateInput(dto: UpdatePublisherDto): Prisma.PublisherUpdateInput {
    const data: Prisma.PublisherUpdateInput = {
      name: dto.name ?? undefined
    }

    return data;
  }

  static toWhereInput(filters: Omit<PublishersQueryDto, "sortBy" | "sortOrder" | "pageNo" | "pageSize">): Prisma.PublisherWhereInput {
    const where: Prisma.PublisherWhereInput = {
      name: filters.search
        ? {contains: filters.search, mode: 'insensitive'}
        : undefined
    }

    return where;
  }

  static toResponseDto(publisher: PublisherEntity): PublisherResponseDto {
    const responseDto: PublisherResponseDto = {
      id: publisher.id,
      name: publisher.name,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt
    }

    return responseDto;
  }
}