import { UserRole } from '../../../generated/prisma/enums';
import { IsEnum } from 'class-validator';
import { CreateUserDto } from './create-user.dto';



export class AdminCreateUserDto extends CreateUserDto {
  @IsEnum(UserRole)
  role: UserRole;
}