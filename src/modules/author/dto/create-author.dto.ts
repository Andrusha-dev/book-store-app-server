import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty()
  imgUrl: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsOptional()
  description?: string;
}
