import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
  @IsOptional()
  readonly search?: string;
}