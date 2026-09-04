import { PickType } from '@nestjs/swagger';
import { CreateCartItemDto } from './create-cart-item.dto';

//PartialType не потрібно вказувати бо це атомарна операція оновлення конкретного поля quantity
export class UpdateCartItemDto extends PickType(CreateCartItemDto, ["quantity"]) {}
