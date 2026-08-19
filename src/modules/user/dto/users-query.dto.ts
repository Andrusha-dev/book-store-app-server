import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../generated/prisma/enums';



export enum UserSortBy {
  CREATED_AT = "createdAt",
  FIRSTNAME = "firstname",
  LASTNAME = "lastname",
}

export class UsersQueryDto extends PageQueryDto {
  @IsEnum(UserSortBy)
  readonly sortBy: UserSortBy = UserSortBy.CREATED_AT;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly search?: string;
}