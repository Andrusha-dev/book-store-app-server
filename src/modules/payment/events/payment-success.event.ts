

//Подія повернення коштів (при оплаті карткою)
export class PaymentSuccessEvent {
  constructor(readonly orderId: string) {}
}