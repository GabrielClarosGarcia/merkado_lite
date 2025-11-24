import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { ConfirmOrderDto } from './dto/confirm-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/confirm')
  async confirmOrder(@Body() dto: ConfirmOrderDto) {
    return await this.orderService.confirmOrder(
      dto.customerId,
      dto.deliveryMethod,
      dto.paymentMethod,
    );
  }
}
