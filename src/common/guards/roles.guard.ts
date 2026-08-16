import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ITokenPayload } from '../types/token-payload.interface';
import { ROLES_KEY } from '../decorators/auth.decorator';
import type { UserRole } from '../../generated/prisma/enums';



@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Зчитуємо ролі, передані через декоратор метаданих SetMetadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Якщо ролі не передавались через метадані, пускаємо далі
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Отримуємо об'єкт запиту та користувача (якого туди поклав JwtAuthGuard)
    const request = context
      .switchToHttp()
      .getRequest<{ user?: ITokenPayload }>();
    const user = request.user;

    // Захист, якщо гарда автентифікації не була викликана: перевірка у рантаймі
    if (!user) {
      throw new InternalServerErrorException(
        'RolesGuard used without JwtAuthGuard',
      );
    }

    return requiredRoles.includes(user.role);
  }
}