import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import type { Response } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { IOAuthUser } from './types/oauth-user.interface';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../core/config/app-config.schema';
import { OAuthUser } from './decorators/oauth-user.decorator';
import { ApiErrorResponse } from '../../common/decorators/api-error-response.decorator';
import { ApiOkResponse } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly logger: Logger
  ) {}

  //автентифікація через email + password
  @Post('login-with-credentials')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiErrorResponse()
  async loginWithCredentials(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.loginWithCredentials(dto);

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken }; // Повертаємо клієнту тільки Access Token!
  }

  //OAuth автентифікація через сервіс google
  // 1. Ініціація входу (перенаправляє на Google)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Порожній метод — GoogleAuthGuard сам зробить redirect на Google
  }
  // 2. Callback від Google (сюди повертається користувач)
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard) //Гарда, яка використовуючи GoogleStrategy, кладе отримані дані від сервісу Google в req.user
  async googleAuthCallback(
    @OAuthUser() user: IOAuthUser, //кастомний декоратор, який повертає OAuthUser з req.user, куди його поклала GoogleAuthGuard
    @Res() res: Response,
  ): Promise<void> {
    const { provider, providerId, email } = user;

    //Витягуємо тільки refreshToken
    const { refreshToken } = await this.authService.loginWithOAuth(
      provider,
      providerId,
      email,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    //accessToken не повертаємо. Його клієнт отримає через окремий запит refresh()
    const frontendUrl = this.configService.get('FRONTEND_URL', { infer: true });
    res.redirect(`${frontendUrl}`);
  }

  //Відновлення jwt токена
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiErrorResponse()
  refresh(
    @CurrentUser() user: ITokenPayload,
    @Res({ passthrough: true }) res: Response,
  ): AuthResponseDto {
    const { accessToken, refreshToken } = this.authService.refreshTokens(user);

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Для видалення куки обов'язково вказувати той самий path!
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    return { message: 'Успішний вихід' };
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    const isProduction =
      this.configService.get('NODE_ENV', { infer: true }) === 'production';

    res.cookie('refreshToken', token, {
      httpOnly: true, //Захист від XSS (JS у браузері не має доступу)
      secure: isProduction, // Тільки по HTTPS у продакшені
      sameSite: 'lax', //Захист від CSRF
      path: '/api/v1/auth/refresh', //Кука надсилатиметься ТІЛЬКИ на роут /auth/refresh
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів у мс
    });
  }
}
