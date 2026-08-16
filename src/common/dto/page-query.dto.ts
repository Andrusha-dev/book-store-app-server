import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';


export enum SortOrder {
  ASC = "asc",
  DESC = "desc"
}

export class PageQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly pageNo: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly pageSize: number = 10;

  @IsEnum(SortOrder)
  readonly sortOrder: SortOrder = SortOrder.ASC;
}