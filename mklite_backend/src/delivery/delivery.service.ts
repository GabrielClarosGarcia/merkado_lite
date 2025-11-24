import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { Delivery } from './delivery.entity';
import { Order } from 'src/order/order.entity';
import { User } from 'src/user/user.entity';
import { DeliverDto } from './dto/deliver.dto';

@Injectable()
export class DeliveryService {

  async deliverOrder(orderId: number, dto: DeliverDto) {
    // 1. Obtener el registro Delivery asociado al pedido
    const delivery = await AppDataSource.manager.findOne(Delivery, {
      where: { order: { id_order: orderId } },
      relations: ['order', 'driver'],
    });

    if (!delivery)
      throw new Error('No existe un registro de delivery para este pedido');

    if (delivery.status === 'delivered')
      throw new Error('Este pedido ya fue entregado');

    // 2. Validar conductor
    const driver = await AppDataSource.manager.findOneBy(User, { id_user: dto.driverId });
    if (!driver) throw new Error('El conductor no existe');

    // 3. Actualizar datos de delivery
    delivery.driver = driver;
    delivery.status = 'delivered';
    delivery.delivered_date = new Date();

    await AppDataSource.manager.save(Delivery, delivery);

    // 4. Actualizar pedido
    const order = await AppDataSource.manager.findOneBy(Order, { id_order: orderId });
    if (order) {
      order.status = 'delivered';
      await AppDataSource.manager.save(Order, order);
    }

    return { message: 'Pedido entregado correctamente', delivery };
  }
}
