import type { OrderResponseDto } from './order-response.dto';


export class CheckoutResponseDto {
  readonly order: OrderResponseDto;
  readonly paymentUrl: string | null;
}