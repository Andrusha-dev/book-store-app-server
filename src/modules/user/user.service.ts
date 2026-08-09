import { Injectable} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type UserEntity, userInclude} from './entities/user.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from "bcrypt"
import type { IdentityProvider } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';
import { Logger } from 'nestjs-pino';


@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto>  {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const data: Prisma.UserCreateInput = CreateUserDto.toCreateInput(createUserDto, passwordHash);
    const userEntity: UserEntity = await this.prismaService.user.create({
      data: data,
      include: userInclude
    });
    this.logger.log("User created");

    const responseDto: UserResponseDto = UserResponseDto.fromEntity(userEntity);

    return responseDto;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async verifyCredentials(email: string, password: string): Promise<UserResponseDto | null> {
    const user: UserEntity | null = await this.findByEmail(email);
    if (!user) return null;

    if (!user.passwordHash) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    const responseDto = UserResponseDto.fromEntity(user);
    return responseDto;
  }

  async verifyOrCreateOAuthUser (provider: IdentityProvider, providerId: string, email: string): Promise<UserResponseDto> {
    let user: UserEntity | null = await this.prismaService.user.findFirst({
      where: {
        identities: {
          some: {
            provider: provider,
            providerId: providerId,
          },
        },
      },
      include: userInclude
    });

    //Якщо користувача не знайдено
    if (!user) {
      //Первіряємо чи існує користувач з переданим email
      const existingUser = await this.findByEmail(email);

      if (existingUser) {
        // Оновлюємо існуючого користувача: додаємо нову identity
        user = await this.prismaService.user.update({
          where: { id: existingUser.id },
          data: {
            identities: {
              create: { provider, providerId }
            }
          },
          include: userInclude
        })
      } else {
        //Якщо користувача не існує ні через provider+providerId ні через email, то створюєм нового користувача з Identity
        user = await this.prismaService.user.create({
          data: {
            email: email ?? null, //якщо провайдер не повернув email, то вказуєм null
            identities: {
              create: {
                provider: provider,
                providerId: providerId,
              },
            },
          },
          include: userInclude,
        });
      }
    }

    const responseDto: UserResponseDto = UserResponseDto.fromEntity(user);
    return responseDto;
  }

  private async findByEmail(email: string): Promise<UserEntity | null> {
    const user: UserEntity | null = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      include: userInclude,
    });

    return user;
  }
}
