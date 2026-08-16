import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';


export class CreateUserDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'поле не може бути порожнім' })
  email: string;

  @IsString({ message: 'Поле має бути рядком' })
  @MinLength(8, { message: 'Значення поля має містити не менше 8 символів' })
  password: string;

  @IsString({ message: 'Поле має бути рядком' })
  @MinLength(4, { message: 'Значення поля має містити не менше 4 символів' })
  username: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty({ message: 'поле не може бути порожнім' })
  firstname: string;

  @IsString({ message: 'Поле має бути рядком' })
  @IsNotEmpty({ message: 'поле не може бути порожнім' })
  lastname: string;

  @IsString({ message: 'Поле має бути рядком' })
  @Matches(/^\+380\d{9}$/, {
    message: 'Номер телефона має відповідати формату +380XXXXXXXXX',
  })
  phone: string;

  @IsInt({ message: 'Поле має бути цілим числом' })
  @Min(1900, {message: "Значення поля має бути не менше ніж 1900"})
  @Max(new Date().getFullYear(), {message: "Значення поля має бути не більше ніж поточний рік"})
  birthYear: number;

  @IsBoolean({message: "Поле має містити булеве значення (true або false)"})
  isMarried: boolean;
}
