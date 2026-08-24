import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePublisherDto {
  @IsString({message: "Поле має бути рядком"})
  @IsNotEmpty()
  name: string;
}
