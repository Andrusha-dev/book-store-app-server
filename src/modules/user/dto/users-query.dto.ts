import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CoverType, UserRole } from '../../../generated/prisma/enums';
import { Transform } from 'class-transformer';



export enum UserSortBy {
  CREATED_AT = "createdAt",
  FIRSTNAME = "firstname",
  LASTNAME = "lastname",
}

export class UsersQueryDto extends PageQueryDto {
  @IsEnum(UserSortBy)
  readonly sortBy: UserSortBy = UserSortBy.CREATED_AT;

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as unknown[])
  @IsArray({ message: 'Поле \'roles\' має бути масивом' })
  @IsEnum(UserRole, { each: true, message: 'Перелік значень \'roles\' не відповідає допустимим значенням' })
  @IsOptional()
  readonly roles?: UserRole[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly search?: string;
}