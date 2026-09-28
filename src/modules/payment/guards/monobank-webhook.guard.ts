import { Request } from 'express';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  type RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { MonobankProvider } from '../infrastructure/monobank.provider';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../core/config/app-config.schema';

@Injectable()
export class MonobankWebhookGuard implements CanActivate {
  private readonly isSandbox: boolean;

  constructor(
    private readonly monobankProvider: MonobankProvider,
    private readonly configService: ConfigService<AppConfig, true>
  ) {
    this.isSandbox = configService.get<AppConfig['NODE_ENV']>('NODE_ENV') !== 'production';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Якщо не в продакшені, повертаємо true
    if(this.isSandbox) {return true}

    //При передачі типу RawBodyRequest слід обовязково пересвідчитись, що в main.ts увімкнено підтримку rawBody
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const rawBody = request.rawBody;
    const xSign = request.headers['x-sign'];

    if (!rawBody) {
      throw new UnauthorizedException('Тіло запиту відсутнє');
    }

    if (!xSign || typeof xSign !== 'string') {
      throw new UnauthorizedException('Підпис x-sign не був переданий в заголовку, або не є рядком');
    }

    const isVerified = await this.monobankProvider.verifyWebhookSignature(rawBody, xSign);

    if (!isVerified) {
      throw new UnauthorizedException('Підпис x-sign не збігається!');
    }

    return true;
  }
}
