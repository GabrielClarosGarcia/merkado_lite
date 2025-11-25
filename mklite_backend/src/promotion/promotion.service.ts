import { Injectable, NotFoundException } from '@nestjs/common';
import { AppDataSource } from '../data-source';
import { Promotion } from './promotion.entity';
import { Product } from '../product/product.entity';
import { CreatePromotionDto } from './dto/create_promotion.dto';
import { UpdatePromotionDto } from './dto/update_promotion.dto';
import { Inventory } from '../inventory/inventory.entity';
import { User } from 'src/user/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { PromoAutoConfig} from 'src/promotion/promo.config';

@Injectable()
export class PromotionService {
  private promotionRepo = AppDataSource.getRepository(Promotion);
  private productRepo = AppDataSource.getRepository(Product);
  private readonly notificationService: NotificationService;
  private readonly promotionService: PromotionService;

  // ESTADO AUTOMÁTICO
  private getPromotionStatus(start: Date, end: Date): string {
    const now = new Date();

    if (now < start) return 'scheduled';
    if (now >= start && now <= end) return 'active';
    return 'expired';
  }

  // CREAR
  async create(dto: CreatePromotionDto) {
    const products = await this.productRepo.findByIds(dto.product_ids);

    const promotion = this.promotionRepo.create({
      ...dto,
      products,
      status: this.getPromotionStatus(new Date(dto.start_date), new Date(dto.end_date)),
    });

    return await this.promotionRepo.save(promotion);
  }

  // LISTAR TODAS (actualizando estado automáticamente)
  async findAll() {
    const list = await this.promotionRepo.find({
      relations: ['products'],
    });

    for (const promo of list) {
      const newStatus = this.getPromotionStatus(promo.start_date, promo.end_date);
      if (promo.status !== newStatus) {
        promo.status = newStatus;
        await this.promotionRepo.save(promo);
      }
    }

    return list;
  }

  // BUSCAR UNA
  async findOne(id: number) {
    const promo = await this.promotionRepo.findOne({
      where: { id_promotion: id },
      relations: ['products'],
    });

    if (!promo) throw new NotFoundException('Promoción no encontrada');

    promo.status = this.getPromotionStatus(promo.start_date, promo.end_date);

    return promo;
  }

  // EDITAR
  async update(id: number, dto: UpdatePromotionDto) {
    const promo = await this.promotionRepo.findOne({
      where: { id_promotion: id },
      relations: ['products'],
    });

    if (!promo) throw new NotFoundException('Promoción no encontrada');

    Object.assign(promo, dto);

    // Actualizar estado si cambió fecha
    if (dto.start_date || dto.end_date) {
      promo.status = this.getPromotionStatus(
        new Date(promo.start_date),
        new Date(promo.end_date),
      );
    }

    if (dto.product_ids) {
      promo.products = await this.productRepo.findByIds(dto.product_ids);
    }

    return await this.promotionRepo.save(promo);
  }

  // ELIMINAR
  async remove(id: number) {
    const promo = await this.promotionRepo.findOne({
      where: { id_promotion: id },
    });

    if (!promo) throw new NotFoundException('Promoción no encontrada');

    await this.promotionRepo.remove(promo);

    return { message: 'Promoción eliminada correctamente' };
  }

  async generateAutoPromotions() {
  const { defaultDiscountPercentage, defaultDurationDays } = PromoAutoConfig;

  // 1. Obtener productos próximos a vencer
  const inventories = await AppDataSource.manager.find(Inventory, {
    where: { status: 'expiring_soon' },
    relations: ['product'],
  });

  if (!inventories.length) {
    return { message: "No hay productos próximos a vencer" };
  }

  const promotionsToCreate : Promotion[] = [];

  for (const inv of inventories) {
    const product = inv.product;

    // 2. Revisar si ya existe una promoción automática activa
    const existing = await AppDataSource.manager.findOne(Promotion, {
      where: {
        products: { id_product: product.id_product },
        is_auto: true,
        discount_type: 'percentage'
      },
    });

    if (existing) continue; // ignorar si ya tiene

    // 3. Crear promoción automática
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + defaultDurationDays);

    const promo = AppDataSource.manager.create(Promotion, {
      products: [product],
      discount_type: 'percentage',
      value: defaultDiscountPercentage,
      start_date: start,
      end_date: end,
      is_auto: true,
    });

    promotionsToCreate.push(promo);

    // 4. Notificar al administrador
    const admins = await AppDataSource.manager.find(User, {
      where: { role: { name: 'Administrador' } },
      relations: ['role'],
    });

    for (const admin of admins) {
      await this.notificationService.sendNotification(
        `Se creó una oferta automática del ${defaultDiscountPercentage}% para el producto ${product.name}`,
        admin.id_user
      );
    }
  }

  // 5. Guardar todas las promos
  await AppDataSource.manager.save(Promotion, promotionsToCreate);

  return { message: "Promociones automáticas generadas", count: promotionsToCreate.length };
}

}
