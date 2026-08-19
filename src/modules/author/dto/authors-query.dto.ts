import { PageQueryDto } from '../../../common/dto/page-query.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AuthorSortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
}

export class AuthorsQueryDto extends PageQueryDto {
  @IsEnum(AuthorSortBy)
  readonly sortBy: AuthorSortBy = AuthorSortBy.CREATED_AT;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly search?: string;
}
