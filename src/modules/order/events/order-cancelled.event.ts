
export class OrderCancelledEvent {
  constructor(
    readonly orderId: string,
    readonly email: string
  ) {}
}