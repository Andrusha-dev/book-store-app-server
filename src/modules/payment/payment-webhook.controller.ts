import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MonobankWebhookDto } from './dto/monobank-webhook.dto';
import { MonobankWebhookGuard } from './guards/monobank-webhook.guard';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Logger } from 'nestjs-pino';

@Controller('webhooks/payment')
export class PaymentWebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly logger: Logger
  ) {}

  @Post('monobank')
  @UseGuards(MonobankWebhookGuard)
  //Не вказуємо тип dto, щоб не спрацював глобальний пайп і не повернув помилку
  async handleMonobankWebhook(@Body() unvalidatedDto: any) {
    //Здійснюємо валідацію вручну
    const validatedDto = plainToInstance(MonobankWebhookDto, unvalidatedDto);
    const errors = await validate(validatedDto);

    if(errors.length) {
      //Якщо валідація пройшла з помилкою, повертаємо статус 200 і логуєм помилку
      this.logger.error({err: errors}, 'Невалідний формат вхідних даних вебхука монобанку');
      return {status: "ОК"}
    }

    //Якщо під чса зміни статусу оплати стається помилка (наприклад, впала бд), то обробник поверне монобанку помилку.
    //Після цього монобанк буде повторно надсилати ці самі дані, поки не отримає статус 200
    await this.paymentService.updateStatusByWebhook(validatedDto);
    //Якщо ж статус оплати успішно змінено - повертаємо статус 200
    return {status: "ОК"}
  }
}