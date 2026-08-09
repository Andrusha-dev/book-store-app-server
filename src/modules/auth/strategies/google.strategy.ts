import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
} from 'passport-google-oauth20';
import { AppConfig } from '../../../core/config/app-config.schema';
import { ConfigService } from '@nestjs/config';
import { IdentityProvider } from '../../../generated/prisma/enums';
import type { IOAuthUser } from '../types/oauth-user.interface';



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID', { infer: true }),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', { infer: true }),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL', { infer: true }),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): IOAuthUser {
    const email = profile.emails?.[0]?.value;

    if(!email) {
      throw new UnauthorizedException('Сервіс google не повернув email');
    }

    // Формуємо об'єкт, який потрапить у req.user
    const oauthUser: IOAuthUser = {
      provider: IdentityProvider.GOOGLE, // або 'GOOGLE'
      providerId: profile.id,
      email: email,
    };

    return oauthUser;
  }
}