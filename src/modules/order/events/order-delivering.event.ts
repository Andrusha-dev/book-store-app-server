
export class OrderDeliveringEvent {
  constructor(
    readonly orderId: string,
    readonly email: string
  ) {}
}