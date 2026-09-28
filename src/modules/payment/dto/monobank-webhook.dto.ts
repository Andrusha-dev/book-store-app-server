import { IsNotEmpty, IsString } from 'class-validator';


export class MonobankWebhookDto {
  @IsString({ message: 'Поле "invoiceId" має бути рядком' })
  @IsNotEmpty({ message: 'Поле "invoiceId" не має бути пустим' })
  readonly invoiceId: string;

  @IsString({ message: 'Поле "reference" має бути рядком' })
  @IsNotEmpty({ message: 'Поле "reference" не має бути пустим' })
  readonly reference: string; //ID замовлення, який передавався під час створення інвойсу

  @IsString({ message: 'Поле "status" має бути рядком' })
  @IsNotEmpty({ message: 'Поле "status" не має бути пустим' })
  readonly status: string;
}