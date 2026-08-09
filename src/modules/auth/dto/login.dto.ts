import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';


export class LoginDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'email не може бути порожнім' })
  email: string;

  @IsString({ message: 'Пароль має бути рядком' })
  @IsNotEmpty({ message: 'Пароль не може бути порожнім' })
  @MinLength(8, {message: "Пароль має містити не менше 8 символів"})
  password: string;
}
