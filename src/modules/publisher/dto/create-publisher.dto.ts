import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreatePublisherDto {
  @IsString({message: "Поле має бути рядком"})
  @IsNotEmpty()
  name: string;

  @IsUrl({}, {message: "Поле має відповідати формату URL"})
  logoUrl: string;
}
