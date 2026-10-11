import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import type { UserRole } from '../../generated/prisma/enums';
import { ApiBearerAuth } from '@nestjs/swagger';


export const ROLES_KEY = 'roles';

//Декоратор для локального застосування гардів автентифікації та авторизації
export const Auth = (...roles: UserRole[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth() //Декоратор swagger, який підсвічуватиме захищені маршрути в докуметації
  );
};
