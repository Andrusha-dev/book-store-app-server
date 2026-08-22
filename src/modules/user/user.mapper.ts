import {
  type UserEntity,
} from './entities/user.entity';
import {
  type UserResponseDto,
} from './dto/user-response.dto';
import type { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '../../generated/prisma/client';
import type { UsersQueryDto } from './dto/users-query.dto';


export class UserMapper {
  static toCreateInput(
    dto: CreateUserDto,
    passwordHash: string,
  ): Prisma.UserCreateInput {
    const { password, ...restData } = dto;

    const data: Prisma.UserCreateInput = {
      ...restData,
      passwordHash,
    };

    return data;
  }

  static toWhereInput(filters: Omit<UsersQueryDto, "sortBy" | "sortOrder" | "pageNo" | "pageSize">): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      role: filters.role ? filters.role : undefined,
    };

    if(filters.search) {
      where.OR = [
        {
          username: { contains: filters.search, mode: 'insensitive' },
        },
        {
          firstname: { contains: filters.search, mode: 'insensitive' },
        },
        {
          lastname: { contains: filters.search, mode: 'insensitive' },
        },
        {
          email: { contains: filters.search, mode: 'insensitive' },
        },
      ];
    }

    return where;
  }

  static toResponseDto(user: UserEntity): UserResponseDto {
    const responseDto: UserResponseDto = {
      id: user.id,
      email: user.email,
      username: user.username ?? undefined,
      firstname: user.firstname ?? undefined,
      lastname: user.lastname ?? undefined,
      phone: user.phone ?? undefined,
      birthYear: user.birthYear ?? undefined,
      isMarried: user.isMarried,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return responseDto;
  }
}