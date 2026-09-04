import { IsInt, IsUUID, Min } from 'class-validator';


export class CreateCartItemDto {
  @IsUUID("all", {message: 'поле \'productId\' має бути коректним UUID'})
  readonly productId: string;

  @IsInt({message: 'Поле \'quantity\' має бути цілим числом'})
  @Min(1, {message: 'Поле \'quantity\' має бути не менше 1'})
  readonly quantity: number;
}