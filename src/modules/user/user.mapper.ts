import {
  type UserEntity,
} from './entities/user.entity';
import {
  type UserResponseDto,
} from './dto/user-response.dto';

import { Prisma } from '../../generated/prisma/client';
import { UsersQueryDto } from './dto/users-query.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { CreateUserDto } from './dto/create-user.dto';



export class UserMapper {
  static toCreateInput(dto: CreateUserDto, passwordHash: string,): Prisma.UserCreateInput {
    const { password, ...restData } = dto;

    const data: Prisma.UserCreateInput = {
      email: restData.email,
      username: restData.username,
      firstname: restData.firstname,
      lastname: restData.lastname,
      phone: restData.phone,
      birthYear: restData.birthYear,
      isMarried: restData.isMarried,
      //вказуєм passwordHash
      passwordHash,
      //Створюєм кошик через реляцію
      cart: {
        create: {}
      }
    };

    return data;
  }

  static toCreateInputForAdmin(dto: AdminCreateUserDto, passwordHash: string): Prisma.UserCreateInput {
    const data: Prisma.UserCreateInput = UserMapper.toCreateInput(dto, passwordHash)
    data.role = dto.role;

    return data;
  }

  static toWhereInput(filters: Omit<UsersQueryDto, "sortBy" | "sortOrder" | "pageNo" | "pageSize">): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      role: filters.roles?.length ?
        {in: filters.roles}
        : undefined
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