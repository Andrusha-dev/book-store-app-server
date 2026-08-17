import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({message: "Поле має бути рядком"})
  @IsNotEmpty()
  name: string;
}
