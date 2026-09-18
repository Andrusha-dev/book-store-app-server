import type { CreateDeliveryDto } from '../dto/create-delivery.dto';
import type { OrderResponseDto } from '../../order/dto/order-response.dto';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../core/config/app-config.schema';
import type { OrderPaymentMethod } from '../../../generated/prisma/enums';
import { BadGatewayException, BadRequestException } from '@nestjs/common';


export interface ICreateTrackingRequest {
  readonly paymentMethod: OrderPaymentMethod;
  readonly amount: number;
  readonly recipientFirstname: string;
  readonly recipientLastname: string;
  readonly recipientPhone: string;
  readonly cityName: string;
  readonly cityRef: string;
  readonly warehouseName: string;
  readonly warehouseRef: string;
  readonly volumeM3: number;
  readonly weightKGrams: number;
}

interface ICreateTrackingResponse {
  trackingNumber: string;
}

interface INovaPoshtaResponse {
  success: boolean;
  errors: string[];
  data: {IntraDocNumber: string}[] //Якщо ТТН одна, то в масиві буде лише один об'єкт
}

export class NovaPoshtaProvider {
  private readonly citySender: string;
  private readonly sender: string;
  private readonly senderAddress: string;
  private readonly contactSender: string;
  private readonly sendersPhone: string;
  private readonly novaPoshtaUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    this.citySender = configService.get('NP_SENDER_CITY_REF', { infer: true });
    this.sender = this.configService.get('NP_SENDER_REF', { infer: true });
    this.senderAddress = this.configService.get('NP_SENDER_WAREHOUSE_REF', { infer: true });
    this.contactSender = this.configService.get('NP_SENDER_CONTACT_REF', { infer: true });
    this.sendersPhone = this.configService.get('NP_SENDER_PHONE', { infer: true });
    this.novaPoshtaUrl = configService.get('NP_API_URL', { infer: true });
  }

  //Метод для створення ттн доставки замовлення(через api нової пошти)
  async createTracking(
    request: ICreateTrackingRequest,
  ): Promise<ICreateTrackingResponse> {
    //Дані, які передаються лише, коли оплата готівкою (накладений платіж)
    const backwardDeliveryData =
      request.paymentMethod === 'CASH'
        ? [
            {
              PayerType: 'Recipient', // Хто платить за комісію зворотної доставки (Отримувач або Відправник)
              CargoType: 'Money', // Тип зворотної доставки — гроші
              RedeliveryString: 'Оплата за замовлення',
              Amount: request.amount.toFixed(2), // Сума післяплати
            },
          ]
        : undefined;

    const npPayload = {
      apiKey: this.configService.get('NP_API_KEY', { infer: true }),
      modelName: 'InternetDocument',
      calledMethod: 'save',
      methodProperties: {
        PayerType: 'Recipient',
        PaymentMethod: request.paymentMethod === 'CASH' ? 'Cash' : 'NonCash',
        //Дата у вигляді форматованої строки для української локалізації (наприклад '16.09.2026')
        DateTime: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        CargoType: 'Parcel', // або Cargo
        Weight: request.weightKGrams.toFixed(2),
        VolumeGeneral: request.volumeM3.toFixed(4),
        SeatsAmount: '1',
        Cost: request.amount.toFixed(2), // Оціночна вартість для страховика = сумі замовлення
        ServiceType: 'WarehouseWarehouse',
        Description: 'Інтернет-замовлення',
        //Дані відправника
        CitySender: this.citySender,
        Sender: this.sender,
        SenderAddress: this.senderAddress,
        ContactSender: this.contactSender,
        SendersPhone: this.sendersPhone,
        //Дані отримувача
        CityRecipient: request.cityRef,
        RecipientAddress: request.warehouseRef,
        RecipientsPhone: request.recipientPhone,
        FirstName: request.recipientFirstname,
        LastName: request.recipientLastname,
        RecipientType: 'PrivatePerson',
        //Блок зворотньої доставки (якщо післяплата)
        BackwardDeliveryData: backwardDeliveryData,
      },
    };

    const trackingNumber = await this.createTrackingProcess(npPayload);
    return {trackingNumber}
  }

  //Перевіряє, чи метрики замовлення підходять для відправки у поштомат
  canSendToPostomat(weightKGrams: number, lengthSm: number): boolean {
    if (
      this.configService.get('NP_POSTOMAT_MAX_WEIGHT_KG', { infer: true }) < weightKGrams ||
      this.configService.get('NP_POSTOMAT_MAX_LENGTH_SM', { infer: true }) < lengthSm
    ) {
      return false;
    }

    return true;
  }

  private async createTrackingProcess(npPayload: any): Promise<string> {
    try {
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(npPayload),
      });

      if (!response.ok) {
        throw new BadGatewayException('Сервіс "Нова пошта" відхилив запит');
      }

      const result = (await response.json()) as INovaPoshtaResponse;

      //При помилках валідації, НП повертає статус 200, тому обовязково перевіряєм поле success
      if (!result.success) {
        //Перетворюємо отриману помилку в рядок і генеруєм помилку
        const errorMessage = result.errors.join(', ');
        throw new BadGatewayException(`Помилка створення ТТН: ${errorMessage}`);
      }

      //Якщо помилки немає - витягуємо номер ТТН
      return result.data[0].IntraDocNumber;
    } catch (error) {
      if (error instanceof BadGatewayException) {throw error}
      throw new BadGatewayException('При підключенні до серверу нової пошти сталася помилка. Спробуйте пізніше');
    }
  }
}