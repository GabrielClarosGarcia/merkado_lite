import { Controller, Param, Body, Put } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliverDto } from './dto/deliver.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Put('deliver/:orderId')
  deliverOrder(
    @Param('orderId') orderId: number,
    @Body() deliverDto: DeliverDto,
  ) {
    return this.deliveryService.deliverOrder(orderId, deliverDto);
  }
}
