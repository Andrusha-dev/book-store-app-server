import { CoverType } from '../../../generated/prisma/enums';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISBN,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Поле має бути рядком' })
  @MinLength(4, { message: 'Поле має містити не менше 4 символів' })
  name: string;

  @IsArray({ message: 'Поле має бути масивом' })
  @IsUrl({}, { each: true, message: 'елементи масиву мають бути URL' })
  imgUrls: string[];

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Поле має бути числом (з двома розрядами після плаваючої точки)',
    },
  )
  @Min(0, { message: 'Поле не може бути менше 0' })
  price: number;

  @IsString({ message: 'Поле має бути рядком' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(0, {message: "Поле не може бути менше 0"})
  quantity: number;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(0, { message: 'Поле не може бути менше 0' })
  widthMm: number;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(0, { message: 'Поле не може бути менше 0' })
  heightMm: number;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(0, { message: 'Поле не може бути менше 0' })
  depthMm: number;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(0, { message: 'Поле не може бути менше 0' })
  weightGrams: number;

  @IsISBN(undefined, { message: 'Некоректний формат ISBN' })
  isbn: string;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(1, { message: 'Поле має бути більше 0' })
  pages: number;

  @IsEnum(CoverType)
  coverType: CoverType;

  @IsString({ message: 'Поле має бути рядком' })
  @MinLength(2, {message: "Поле має містити щонайменше два символи"})
  language: string;

  @IsArray({ message: 'categoryIds має бути масивом' })
  @IsUUID('all', { each: true, message: 'Кожен ID категорії має бути UUID' })
  @IsOptional()
  categoryIds: string[];

  @IsUUID('all', { message: 'Поле має бути коректним UUID' })
  authorId: string;

  @IsUUID('all', { message: 'Поле має бути коректним UUID' })
  publisherId: string;
}
