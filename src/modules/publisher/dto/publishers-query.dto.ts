import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PublisherSortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
}

export class PublishersQueryDto extends PageQueryDto {
  @IsEnum(PublisherSortBy)
  readonly sortBy: PublisherSortBy = PublisherSortBy.CREATED_AT;

  @IsString({message: "Поле має бути рядком"})
  @IsNotEmpty({message: "Поле не може бути пустим"})
  @IsOptional()
  readonly search?: string;
}