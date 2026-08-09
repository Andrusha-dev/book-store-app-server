import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ITokenPayload } from '../types/token-payload.interface';



//Декоратор для отримання user після автентифікації. Перед ним має обовязково викликатись гарда автентифікації
export const CurrentUser = createParamDecorator(
  (data: keyof ITokenPayload | undefined, ctx: ExecutionContext) => {
    //Щоб не імпортувати Request з Express, власноруч параметризуєм req.user
    const request = ctx.switchToHttp().getRequest<{user?: ITokenPayload}>();
    const user = request.user;

    // Захист, якщо гарда автентифікації не була викликана: перевірка у рантаймі
    if (!user) {
      throw new InternalServerErrorException('CurrentUser decorator used without JwtAuthGuard',);
    }

    return data ? user[data] : user;
  },
);
