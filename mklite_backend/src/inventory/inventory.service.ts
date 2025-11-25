import { Injectable, BadRequestException } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { Inventory } from './inventory.entity';
import { Product } from '../product/product.entity';
import { UpdateInventoryDto } from './dto/update_inventory.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from 'src/user/user.entity';
import { PromotionService } from 'src/promotion/promotion.service';

@Injectable()
export class InventoryService {

    constructor(
        private readonly notificationService: NotificationService,
        private readonly promotionService: PromotionService,
    ) {}

  // obtener inventario completo
  async getAllInventory() {
    return AppDataSource.manager.find(Inventory, {
      relations: ['product'],
      order: { id_inventory: 'ASC' }
    });
  }

  // actualizar stock
  async updateStock(dto: UpdateInventoryDto) {
    const inventory = await AppDataSource.manager.findOne(Inventory, {
      where: { product: { id_product: dto.productId } },
      relations: ['product']
    });

    if (!inventory) throw new BadRequestException('Inventario no encontrado');
    
    inventory.quantity += dto.quantity; // puede ser + o -
    
    if (inventory.quantity < 0) 
      throw new BadRequestException(`Stock insuficiente para ${inventory.product.name}`);

    await AppDataSource.manager.save(Inventory, inventory);

    if (inventory.quantity <= inventory.min_stock) {
      const users = await AppDataSource.manager.find(User, {
        where: { role: { name: 'Encargado de Almacen' } }, 
        relations: ['role']
      });

      for (const user of users) {
        const msg = `El producto ${inventory.product.name} tiene stock bajo. Cantidad: ${inventory.quantity}, mínimo: ${inventory.min_stock}`;
        await this.notificationService.sendNotification(msg, user.id_user);
      }
    }

    return { message: 'Inventario actualizado', inventory };
  }

  // opcional: obtener stock de un producto
  async getStockByProduct(productId: number) {
    const inventory = await AppDataSource.manager.findOne(Inventory, {
      where: { product: { id_product: productId } },
      relations: ['product']
    });
    if (!inventory) throw new BadRequestException('Inventario no encontrado');
    return inventory;
  }

  async getInventoryStatus() {
        return { status: "Inventory service is running" };
    }

    async getLowStockItems() {
        return AppDataSource.manager
    .getRepository(Inventory)
    .createQueryBuilder("inv")
    .leftJoinAndSelect("inv.product", "product")
    .where("inv.quantity <= inv.min_stock")
    .getMany();
    }

    async checkExpirations() {
    const today = new Date();
    const fifteenDays = new Date();
    fifteenDays.setDate(today.getDate() + 15);

    const inventories = await AppDataSource.manager.find(Inventory, {
      relations: ['product']
    });

    const users = await AppDataSource.manager.find(User, {
      where: { role: { name: 'Administrador' } }, 
      relations: ['role']
    });

    const sellers = await AppDataSource.manager.find(User, {
      where: { role: { name: 'Vendedor' } },
      relations: ['role']
    });

    for (const inv of inventories) {
      if (!inv.product.expiration_date) continue;

      let newStatus: 'normal' | 'expiring_soon' | 'expired' = 'normal';

      if (inv.product.expiration_date < today) newStatus = 'expired';
      else if (inv.product.expiration_date <= fifteenDays) newStatus = 'expiring_soon';

      if (inv.status !== newStatus) {
        inv.status = newStatus;
        await AppDataSource.manager.save(Inventory, inv);

        if (newStatus !== 'normal') {
          const message = `El producto ${inv.product.name} está ${newStatus.replace('_', ' ')}.`;
          for (const user of [...users, ...sellers]) {
            await this.notificationService.sendNotification(message, user.id_user);
          }
        }
      }
    }
    await this.promotionService.generateAutoPromotions();

    return { message: 'Verificación de vencimientos completada' };
  }

  async getProductsByExpiration(status?: 'normal' | 'expiring_soon' | 'expired') {
    const query = AppDataSource.manager
        .getRepository(Inventory)
        .createQueryBuilder('inv')
        .leftJoinAndSelect('inv.product', 'product');

    if (status) {
        query.where('inv.status = :status', { status });
    }

    return query.getMany();
}


}