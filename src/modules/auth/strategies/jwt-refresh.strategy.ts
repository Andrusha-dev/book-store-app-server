import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type { ITokenPayload } from '../../../common/types/token-payload.interface';
import type { AppConfig } from '../../../core/config/app-config.schema';




@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    super({
      //Витягуємо токен з cookie замість Bearer заголовка
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.refreshToken as string | undefined) ?? null, //якщо кука з refreshToken є то повертаєм refreshToken, якщо ні, то повертаєм null
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET', {infer: true}),
    });
  }

  // Якщо токен прострочений або підпис невалидний, метод навіть не викличеться (Passport викине 401)
  validate(payload: ITokenPayload): ITokenPayload {
    return payload;
  }
}