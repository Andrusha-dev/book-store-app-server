import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { IOAuthUser } from '../types/oauth-user.interface';

//Декоратор для отримання user після автентифікації. Перед ним має обовязково викликатись гарда автентифікації
export const OAuthUser = createParamDecorator(
  (data: keyof IOAuthUser | undefined, ctx: ExecutionContext) => {
    //Щоб не імпортувати Request з Express, власноруч параметризуєм req.user
    const request = ctx.switchToHttp().getRequest<{user?: IOAuthUser}>();
    const user = request.user;

    // Захист, якщо гарда автентифікації не була викликана: перевірка у рантаймі
    if (!user) {
      throw new InternalServerErrorException(
        'OAuthUser decorator used without necessary AuthGuard (GoogleAuthGuard, GithubAuthGuard or else)',
      );
    }

    return data ? user[data] : user;
  },
);
