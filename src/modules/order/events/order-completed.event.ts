
export class OrderCompletedEvent {
  constructor(
    readonly orderId: string,
    readonly email: string) {}
}