import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../core/config/app-config.schema';
import type { IdentityProvider } from '../../generated/prisma/enums';
import type { UserEntity } from '../user/entities/user.entity';
import type { IdentityEntity } from './entities/identity.entity';
import { PrismaService } from '../../core/database/prisma.service';
import { UserResponseDto } from '../user/dto/user-response.dto';



//Створюєм контракт для результату автентифікації, який містить обидва токени. А контроллер повертатиме клієнту dto лише з accessToken
export interface IAuthResult {
  accessToken: string;
  refreshToken: string;
}


@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async loginWithCredentials(dto: LoginDto): Promise<IAuthResult> {
    const user = await this.userService.verifyCredentials(dto.email, dto.password,);
    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const tokenPayload: ITokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Генеруємо обидва токени
    const result: IAuthResult = this.generateTokens(tokenPayload);

    return result;
  }

  async loginWithOAuth(provider: IdentityProvider, providerId: string, email: string): Promise<IAuthResult> {
    //Шукаємо користувача за email. Якщо такого не має, то створюємо
    const user: UserResponseDto = await this.userService.findOrCreateByEmail(email);

    //Перевіряємо чи існує користувач з необхідним типом IdentityProvider
    const identity: IdentityEntity | null = await this.prismaService.identity.findFirst({
      where: {
        userId: user.id,
        provider
      }
    });

    //Якщо в користувача відсутній необхідний тип IdentityProvider, то створюєм нове Identity та звязуємо його з користувачем
    if(!identity) {
      await this.prismaService.identity.create({
        data: {
          provider,
          providerId,
          user: {
            connect: { id: user.id }
          }
        }
      })
    }

    const tokenPayload: ITokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    //Генеруємо токени
    const result: IAuthResult = this.generateTokens(tokenPayload);

    return result;

    /*
    const user = await this.userService.verifyOrCreateOAuthUser(provider, providerId, email);

    const tokenPayload: ITokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const result: IAuthResult = this.generateTokens(tokenPayload)

    return result;
     */
  }

  refreshTokens(payload: ITokenPayload): IAuthResult {
    const tokenPayload: ITokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const result: IAuthResult = this.generateTokens(tokenPayload);

    return result;
  }

  private generateTokens (payload: ITokenPayload): IAuthResult {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET', { infer: true }),
      expiresIn: this.configService.get('ACCESS_EXPIRES_IN', { infer: true }),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET', { infer: true }),
      expiresIn: this.configService.get('REFRESH_EXPIRES_IN', { infer: true, }),
    });

    const result: IAuthResult = {
      accessToken,
      refreshToken,
    }

    return result;
  }

}
