import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../core/config/app-config.schema';
import type { ITokenPayload } from '../../../common/types/token-payload.interface';
import { Injectable } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(
      private readonly configService: ConfigService<AppConfig, true>
    ) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get('ACCESS_TOKEN_SECRET', { infer: true }),
      });
    }

    //Тип ITokenPayload тут скоріше символічний, бо в рантаймі точно не відомо що міститься в payload
    validate(payload: ITokenPayload): ITokenPayload {
      return payload;
    }
}