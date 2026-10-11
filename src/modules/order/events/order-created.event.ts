

export class OrderCreatedEvent {
  constructor(
    readonly orderId: string,
    readonly email: string
  ) {}
}