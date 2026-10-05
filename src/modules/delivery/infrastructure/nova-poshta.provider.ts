import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../core/config/app-config.schema';
import { OrderPaymentMethod} from '../../../generated/prisma/enums';
import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { z } from 'zod';
import { Logger } from 'nestjs-pino';


export interface CreateTrackingRequest {
  readonly paymentMethod: OrderPaymentMethod;
  readonly amount: number;
  readonly recipientFirstname: string;
  readonly recipientLastname: string;
  readonly recipientPhone: string;
  readonly cityName: string;
  readonly cityRef: string;
  readonly warehouseName: string;
  readonly warehouseRef: string;
  readonly widthSm: number;
  readonly heightSm: number;
  readonly depthSm: number;
  readonly volumeM3: number;
  readonly weightKGrams: number;
}

//Контракт даних, що містить номер ТТН під час створення ТТН
const trackingDataSchema = z.object({
  IntDocNumber: z.string()
});
export type TrackingData = z.infer<typeof trackingDataSchema>;

//Контракт відповіді від НП при створенні ттн
const createTrackingResponseSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  data: z.array(trackingDataSchema)
});
type CreateTrackingResponse = z.infer<typeof createTrackingResponseSchema>;

//Контракт, що містить статус доставки при перевірці статусу доставки
const  trackingStatusItemSchema = z.object({
  Number: z.string(),
  StatusCode: z.string()
});
export type TrackingStatusItem = z.infer<typeof trackingStatusItemSchema>;

//Контракт відповіді від нової пошти при перевірці статусу доставки
const trackingStatusResponseSchema  = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  data: z.array(trackingStatusItemSchema)
});
type TrackingStatusResponse = z.infer<typeof trackingStatusResponseSchema>;

/*
//Контракт даних, що містить номер ТТН під час створення ТТН
export interface ITrackingData {
  IntDocNumber: string;
}
//Контракт відповіді від НП при створенні ттн
interface ICreateTrackingResponse {
  success: boolean;
  errors: string[];
  data: ITrackingData[] //Якщо ТТН одна, то в масиві буде лише один об'єкт
}
 */

/*
//Контракт, що містить статус доставки при перевірці статусу доставки
export interface ITrackingStatusItem {
  Number: string;
  StatusCode: string;
}
//Контракт відповіді від нової пошти при перевірці статусу доставки
interface ITrackingStatusResponse {
  success: boolean;
  errors: string[];
  data: ITrackingStatusItem[];
}
 */

@Injectable()
export class NovaPoshtaProvider {
  private readonly citySender: string;
  private readonly sender: string;
  private readonly senderAddress: string;
  private readonly contactSender: string;
  private readonly sendersPhone: string;
  private readonly novaPoshtaUrl: string;
  private readonly novaPoshtaApiKey: string;
  private readonly maxHeightSm: number;
  private readonly maxWeightKGrams: number;
  private readonly isSandbox: boolean;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly logger: Logger
  ) {
    this.citySender = configService.get('NP_SENDER_CITY_REF', { infer: true });
    this.sender = configService.get('NP_SENDER_REF', { infer: true });
    this.senderAddress = configService.get('NP_SENDER_WAREHOUSE_REF', { infer: true });
    this.contactSender = configService.get('NP_SENDER_CONTACT_REF', { infer: true });
    this.sendersPhone = configService.get('NP_SENDER_PHONE', { infer: true });
    this.novaPoshtaUrl = configService.get('NP_API_URL', { infer: true });
    this.novaPoshtaApiKey = configService.get("NP_API_KEY", {infer: true});
    this.maxHeightSm = configService.get('NP_POSTOMAT_MAX_HEIGHT_SM', { infer: true });
    this.maxWeightKGrams = configService.get('NP_POSTOMAT_MAX_WEIGHT_KG', { infer: true });
    this.isSandbox = configService.get('NODE_ENV', {infer: true}) !== "production";
  }

  //Метод для створення ттн доставки замовлення(через api нової пошти)
  async createTracking(
    request: CreateTrackingRequest,
  ): Promise<TrackingData> {
    if(this.isSandbox) {
      return { IntDocNumber: `mocked-tracking-number-${crypto.randomUUID()}`};
    }

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
      apiKey: this.novaPoshtaApiKey,
      modelName: 'InternetDocument',
      calledMethod: 'save',
      methodProperties: {
        PayerType: 'Recipient',
        PaymentMethod: request.paymentMethod === 'CASH' ? 'Cash' : 'NonCash',
        //Дата у вигляді форматованої строки для української локалізації (наприклад '16.09.2026')
        DateTime: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        CargoType: 'Parcel', // або Cargo
        Weight: request.weightKGrams.toFixed(2),
        //Загальний об'єм в м.куб.
        VolumeGeneral: request.volumeM3.toFixed(3),
        SeatsAmount: '1',
        //Метрики для посадочних місць. Якщо SeatsAmount = 1, то в масиві тільки один обєкт
        OptionsSeat: [
          {
            weight: request.weightKGrams.toFixed(2),
            volumetricVolume: request.volumeM3.toFixed(3),
            volumetricWidth: request.widthSm.toFixed(1), // Базова ширина в см
            volumetricHeight: request.heightSm.toFixed(1), // Базова висота в см
            volumetricLength: request.depthSm.toFixed(1), // Базова довжина (в моєму випадку товщина) в см
          },
        ],
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

    return await this.createTrackingProcess(npPayload);
  }

  //Перевіряє, чи метрики замовлення підходять для відправки у поштомат
  canSendToPostomat(weightKGrams: number, heightSm: number): boolean {
    console.log(`weightKGrams: ${weightKGrams}, heightSm: ${heightSm}`);
    if (this.maxWeightKGrams < weightKGrams || this.maxHeightSm < heightSm) {
      return false;
    }

    return true;
  }

  async getTrackingStatusItems(trackingNumbers: string[]): Promise<TrackingStatusItem[]> {
    //Якщо ми не в продакшені то повертаємо відповідь заглушку, де статуси всіх ТТН - '1', який під час маппінгу до OrderStatus приведеться до PROCESSING
    if(this.isSandbox) {
      const trackingStatusItems: TrackingStatusItem[] = [];

      for (const trackingNumber of trackingNumbers) {
        const trackingStatusItem: TrackingStatusItem = {
          Number: trackingNumber,
          StatusCode: "1"
        }

        trackingStatusItems.push(trackingStatusItem);
      }

      return trackingStatusItems;
    }

    //Нова пошта дозволяє передавати документи масивом у метод getDocumentStatusDocuments
    const documents = trackingNumbers.map(ttn => {
      return { DocumentNumber: ttn }
    });
    //Тіло запиту
    const npPayload = {
      apiKey: this.novaPoshtaApiKey,
      modelName: 'InternetDocument',
      calledMethod: 'getDocumentStatusDocuments',
      methodProperties: {
        Documents: documents,
      }
    }

    return await this.getTrackingStatusItemsProcess(npPayload);
  }

  //приватний метод для безпосереднього запиту на створення ТТН (викликається безпосередньо в createTracking)
  private async createTrackingProcess(npPayload: any): Promise<TrackingData> {
    try {
      const response = await fetch(`${this.novaPoshtaUrl}/v2.0/json/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(npPayload),
      });

      if (!response.ok) {
        throw new BadGatewayException('Сервіс "Нова пошта" відхилив запит');
      }

      //Розпарсюєм отримані дані і валідуємо їх
      const result = await response.json() as unknown;
      const validatedResult: CreateTrackingResponse = createTrackingResponseSchema.parse(result);

      //При помилках валідації на стороні НП, НП все одно повертає статус 200, тому обовязково перевіряєм поле success
      if (!validatedResult.success) {
        //Перетворюємо отриману помилку в рядок і генеруєм помилку
        const errorMessage = validatedResult.errors.join(', ');
        throw new BadGatewayException(`Помилка створення ТТН: ${errorMessage}`);
      }

      //Витягуємо перший елемент в масиві (бо ми створили лише одну ТТН)
      return validatedResult.data[0];
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof z.ZodError) {throw error}
      throw new BadGatewayException('При підключенні до серверу нової пошти сталася помилка. Спробуйте пізніше');
    }
  }

  private async getTrackingStatusItemsProcess(npPayload: any): Promise<TrackingStatusItem[]> {
    try {
      const response = await fetch(`${this.novaPoshtaUrl}/v2.0/json/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(npPayload),
      });

      if (!response.ok) {
        throw new BadGatewayException(`API нової пошти відхилив запит`);
      }

      const result = await response.json() as unknown;
      const validatedResult: TrackingStatusResponse = trackingStatusResponseSchema.parse(result);

      //При помилках валідації, НП повертає статус 200, тому обовязково перевіряєм поле success
      if (!validatedResult.success) {
        //Перетворюємо отриману помилку в рядок і генеруєм помилку
        const errorMessage = validatedResult.errors.join(', ');
        throw new BadGatewayException(`Помилка API нової пошти при отриманні статусів ТТН: ${errorMessage}`);
      }
      //Повертаємо масив обєктів зі статусами ТТН
      return validatedResult.data;
    } catch (error) {
      if(error instanceof BadGatewayException) {throw error}
      throw new BadGatewayException('При підключенні до серверу нової пошти сталася помилка. Спробуйте пізніше');
    }
  }
}