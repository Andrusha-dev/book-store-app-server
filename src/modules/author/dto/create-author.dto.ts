import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty()
  readonly name: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty()
  readonly imgUrl: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsOptional()
  readonly description?: string;
}
