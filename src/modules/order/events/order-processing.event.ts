

export class OrderProcessingEvent {
  constructor(
    readonly orderId: string,
    readonly email: string
  ) {}
}