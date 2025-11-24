import { IsEnum, IsNotEmpty } from 'class-validator';

export enum DeliveryMethod {
  HOME = 'domicilio',
  PICKUP = 'retiro',
}

export enum PaymentMethod {
  CASH = 'pago_contra_entrega',
}

export class ConfirmOrderDto {
  @IsNotEmpty()
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  customerId: number;
}
