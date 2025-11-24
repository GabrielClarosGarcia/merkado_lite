import { Injectable, BadRequestException } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { Order } from '../order/order.entity';
import { OrderDetail } from '../order_detail/order_detail.entity';
import { Cart } from '../cart/cart.entity';
import { Inventory } from '../inventory/inventory.entity';

@Injectable()
export class OrderService {

  async confirmOrder(customerId: number, deliveryMethod: string, paymentMethod: string) {
    const cart = await AppDataSource.getRepository(Cart).findOne({
      where: { customer: { id_customer: customerId }, status: 'active' },
      relations: ['items', 'items.product', 'items.product.inventory'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío.');
    }
    for (const item of cart.items) {
      if (!item.product.inventory) {
        throw new BadRequestException(
          `El producto ${item.product.name} NO tiene inventario registrado.`
        );
      }

      if (item.quantity > item.product.inventory.quantity) {
        throw new BadRequestException(
          `Stock insuficiente del producto: ${item.product.name}`
        );
      }
    }
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const orderRepo = AppDataSource.getRepository(Order);
    const order = orderRepo.create({
      customer: { id_customer: customerId },
      order_date: new Date(),
      status: 'pending',
      total,
      payment_method: paymentMethod,
    });

    await orderRepo.save(order);

    const detailRepo = AppDataSource.getRepository(OrderDetail);
    const invRepo = AppDataSource.getRepository(Inventory);

    for (const item of cart.items) {

      const detail = detailRepo.create({
        order,
        product: item.product,
        quantity: item.quantity,
        subtotal: Number(item.product.price) * item.quantity,
      });

      await detailRepo.save(detail);

      item.product.inventory.quantity -= item.quantity;
      await invRepo.save(item.product.inventory);
    }

    cart.status = 'ordered';
    await AppDataSource.getRepository(Cart).save(cart);

    return {
      message: 'Pedido confirmado correctamente',
      orderId: order.id_order,
      total,
    };
  }
}
