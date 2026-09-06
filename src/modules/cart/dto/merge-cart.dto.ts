import { CreateCartItemDto } from './create-cart-item.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

//dto для синхронізації клієнтського кошика з кошиком в бд, після того як користувач автентифікувався
export class MergeCartDto {
  @IsArray()
  @ValidateNested({each: true, message: "Елементи масиву поля \"items\" мають відповідати типу CreateCartItemDto"})
  @Type(() => CreateCartItemDto)
  items: CreateCartItemDto[]
}