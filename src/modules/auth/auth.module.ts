import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Module({
  imports: [
    PassportModule, //PassportModule просто імпортуємо. Налаштовувати не обовязково. Він чудово працює з коробки
    JwtModule, //JwtModule теж не налаштовуємо, бо він налаштовує лише accessToken, а для refreshToken все одно доведеться передавати необхідін дані вручну
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy, JwtRefreshStrategy, GoogleStrategy, GoogleAuthGuard, JwtRefreshGuard],
  exports: [AuthService],
})
export class AuthModule {}
