import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../core/config/app-config.schema';
import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';


export interface CreateInvoiceResponse {
  invoiceId: string;
  pageUrl: string; //Лінк на оплату
}

@Injectable()
export class MonobankProvider {
  private readonly monoApiToken: string;
  private cachedPubKey: string | null = null; //Кеш публічний ключ монобанку. Оновлюється методом getPublicKey
  private expiredAt: number = 0; //Термін дії публічного ключа монобанку. Оновлюється методом getPublicKey
  private readonly monoApiUrl: string;
  private readonly frontendUrl: string;
  private readonly backendUrl: string;
  private readonly isSandbox: boolean;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly logger: Logger
  ) {
    this.monoApiToken = configService.get<AppConfig['MONO_API_TOKEN']>('MONO_API_TOKEN');
    this.monoApiUrl = configService.get<AppConfig['MONO_API_URL']>('MONO_API_URL');
    this.frontendUrl = configService.get<AppConfig['FRONTEND_URL']>('FRONTEND_URL');
    this.backendUrl = configService.get<AppConfig['BACKEND_URL']>('BACKEND_URL');
    //sandbox передбачає обовязково наявність режиму, відмінного від production і значення "mock-token" для token.
    //Якщо хоча б одна умова не виконується - здійснюється повноцінна взаємодія з api монобанку, в тому числі, якщо token згенерований в тестовому режимі монобанку
    this.isSandbox = configService.get<AppConfig['NODE_ENV']>('NODE_ENV') !== 'production'
  }

  //Метод для отримання інвойсу від монобанку
  createInvoice = async (
    orderId: string,
    amount: number
  ): Promise<CreateInvoiceResponse> => {
    if (this.isSandbox) {
      //Якщо ми в режимі sandbox, то повертаємо результат-заглушку
      const output: CreateInvoiceResponse = {
        invoiceId: "mocked-invoice-id",
        pageUrl: `https://sandbox.monobank.ua/checkout/mock_pay_page_${orderId}`,
      };

      return output;
    }

    try {
      const response = await fetch(`${this.monoApiUrl}/merchant/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.monoApiToken,
        },
        body: JSON.stringify({
          //Monobank приймає суму в копійках (ціле число), тому множимо на 100
          amount: Math.round(amount * 100),
          ccy: 980, //Код валюти: Гривня (UAH)
          merchantPaymInfo: {
            reference: String(orderId), // тут, а не на верхньому рівні
            destination: `Оплата замовлення №${orderId}`,
          },
          redirectUrl: `${this.frontendUrl}/orders/${orderId}/payment-result`, //Куди повернути клієнта після оплати
          webHookUrl: `${this.backendUrl}/api/v1/payment/webhook/monobank`, //Сюди Моно пришле сповіщення про успішну оплату
        }),
      });

      if (!response.ok) {
        const errorText: string = await response.text();
        throw new BadGatewayException(errorText, '[MONOBANK_SERVICE_ERROR]: Монобанк відхилив запит на створення інвойсу',);
      }

      //Розпарсюємо дані від Моно (нас цікавить поле pageUrl)
      const output: CreateInvoiceResponse = await response.json() as CreateInvoiceResponse;

      return output;
    } catch (error) {
      if (error instanceof BadGatewayException) {throw error}
      throw new BadGatewayException('При підключенні до сервера монобанку сталась помилка. Спробуйте пізніше')
    }
  }

  //Метод для перевірки підпису даних, отриманих з вебхуку монобанку
  async verifyWebhookSignature (rawBody: Buffer, xSign: string): Promise<boolean> {
    //Якщо в режимі пісочниці, то відразу повертаєм true, без фактичної верифікації вхідних даних (необхідно для розробки та тестування)
    if (this.isSandbox) {
      return true;
    }

    if (!rawBody || !xSign) return false;

    try {
      //Отримуємо публічний ключ
      const pubKey = await this.getPublicKey();

      //Валідуємо підпис
      const verifier = crypto.createVerify('sha256');
      verifier.update(rawBody);
      return verifier.verify(pubKey, xSign, 'base64');
    } catch (error) {
      this.logger.error(error, 'Помилка під час перевірки підпису');
      return false;
    }
  }

  //Приватний метод для отримання публічного ключа монобанку з кешу, який періодично перезаписується
  private async getPublicKey(): Promise<string> {
    //Якщо термін дії (ми самі визначаєм термін дії) закешованого ключа ще не вийшов то повертаємо його
    if(this.cachedPubKey && Date.now() < this.expiredAt) {
      return this.cachedPubKey
    }

    //Якщо термін дії публічного ключа вийшов, отримуємо публічний ключ через api монобанку
    const response = await fetch(`${this.monoApiUrl}/merchant/pubkey`, {
      method: 'GET',
      headers: { 'X-Token': this.monoApiToken },
    });

    if (!response.ok) {
      throw new BadGatewayException('[MONOBANK_SERVICE_ERROR]: Монобанк відхилив запит на отримання публічного ключа');
    }

    const { key } = await response.json() as { key: string };
    //Перетворюємо Base64 ключ у об'єкт KeyObject
    this.cachedPubKey = Buffer.from(key, 'base64').toString('utf-8');

    //Генеруєм новий термін дії
    this.expiredAt = Date.now() + 1000 * 60 * 60; //1 година

    return this.cachedPubKey;
  }
}