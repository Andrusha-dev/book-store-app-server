import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { CoverType } from '../../../generated/prisma/enums';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  NAME = 'name',
}

export class ProductsQueryDto extends PageQueryDto {
  @IsEnum(ProductSortBy)
  readonly sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsUUID("all", { message: 'Поле "categoryId" має бути коректним UUID' })
  @IsOptional()
  readonly categoryId?: string;

  @IsUUID("all", {message: 'Поле "categoryId" має бути коректним UUID'})
  @IsOptional()
  readonly authorId?: string;

  @IsUUID("all", {message: 'Поле "publisherId" має бути коректним UUID'})
  @IsOptional()
  readonly publisherId?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Поле \'мінімальна ціна\' має бути числом з двома розрядами після коми' },)
  @Min(0, { message: 'Поле "мінімальна ціна" не може мати значення менше 0' })
  @Max(20000, { message: 'Поле "максимальна ціна" не може мати значення більше 20 000', })
  @IsOptional()
  readonly minPrice?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Поле \'максимальна ціна\' має бути числом з двома розрядами після коми' },)
  @Min(0, { message: 'Поле "мінімальна ціна" не може мати значення менше 0' })
  @Max(20000, { message: 'Поле "максимальна ціна" не може мати значення більше 20 000', })
  @IsOptional()
  readonly maxPrice?: number;

  //Повертає масив, якщо дані фільтра вже є масивом, або створю масив, якщо фільтр має єдине значення
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as unknown[],)
  @IsArray({ message: 'Поле "Тип обкладинки" має бути масивом' })
  @IsEnum(CoverType, { each: true, message: 'Перелік значень "тип обкладинки" не відповідає допустимим значенням', })
  @IsOptional()
  readonly coverTypes?: CoverType[];

  //Повертає масив, якщо дані фільтра вже є масивом, або створю масив, якщо фільтр має єдине значення
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as unknown[],)
  @IsArray({ message: 'Поле "мова" має бути масивом' })
  @IsString({ each: true, message: 'Перелік значень "мова" має містити рядки' })
  @IsNotEmpty({ each: true, message: 'Перелік значень "мова" не можуть бути пустими рядками', })
  @IsOptional()
  readonly languages?: string[];

  @IsString({ message: 'Поле "пошук" має бути рядком' })
  @IsNotEmpty({ message: 'Поле "пошук" не може бути пустим рядком' })
  @IsOptional()
  readonly search?: string;
}