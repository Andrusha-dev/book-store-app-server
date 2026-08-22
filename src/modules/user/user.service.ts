import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type UserEntity} from './entities/user.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from "bcrypt";
import { Prisma } from '../../generated/prisma/client';
import { Logger } from 'nestjs-pino';
import { UserMapper } from './user.mapper';
import type { UsersQueryDto } from './dto/users-query.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';


@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash: string = await bcrypt.hash(dto.password, 10);

    const data: Prisma.UserCreateInput = UserMapper.toCreateInput(
      dto,
      passwordHash,
    );

    const user: UserEntity = await this.prismaService.user.create({
      data
    });
    this.logger.log('User created');

    const responseDto: UserResponseDto = UserMapper.toResponseDto(user);

    return responseDto;
  }

  async findMany(queryDto: UsersQueryDto): Promise<UsersResponseDto> {
    const { sortBy, sortOrder, pageNo, pageSize, ...filters } = queryDto;

    const where: Prisma.UserWhereInput = UserMapper.toWhereInput(filters);

    const [userEntities, totalElements] = await Promise.all([
      this.prismaService.user.findMany({
        where: where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: pageSize,
        skip: pageNo * pageSize
      }),
      this.prismaService.user.count({ where }),
    ]);

    const data: UserResponseDto[] = userEntities.map((user) =>
      UserMapper.toResponseDto(user),
    );
    const meta: PageMetaDto = new PageMetaDto(pageNo, pageSize, totalElements);

    const responseDto: UsersResponseDto = new UsersResponseDto(data, meta);

    return responseDto;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user: UserEntity | null = await this.prismaService.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Користувача з id ${id} не знайдено`);
    }

    const responseDto: UserResponseDto = UserMapper.toResponseDto(user);

    return responseDto;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const data: Prisma.UserUpdateInput = { ...dto };

    const updatedUser: UserEntity = await this.prismaService.user.update({
      where: { id },
      data
    });

    const responseDto: UserResponseDto = UserMapper.toResponseDto(updatedUser);

    return responseDto;
  }

  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user: UserEntity | null = await this.findByEmail(email);
    if (!user) return null;

    if (!user.passwordHash) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    const responseDto: UserResponseDto = UserMapper.toResponseDto(user);
    return responseDto;
  }

  //Метод для виклику в AuthService під час OAuth автентифікації
  async findOrCreateByEmail(email: string): Promise<UserResponseDto> {
    let user: UserEntity | null = await this.findByEmail(email);
    if (!user) {
      user = await this.prismaService.user.create({
        data: { email }
      });
    }
    const responseDto = UserMapper.toResponseDto(user);
    return responseDto;
  }

  private async findByEmail(email: string): Promise<UserEntity | null> {
    const user: UserEntity | null = await this.prismaService.user.findUnique({
      where: {
        email: email,
      }
    });

    return user;
  }
}
