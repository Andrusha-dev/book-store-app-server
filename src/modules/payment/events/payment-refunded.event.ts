

//Подія успішної оплати
export class PaymentRefundedEvent {
  constructor(readonly orderId: string) {}
}