import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { Inventory } from "./inventory.entity";
import { NotificationService } from "../notification/notification.service";
import { User } from "../user/user.entity";

@Injectable()
export class InventoryService {
    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    async getInventoryStatus() {
        return { status: "Inventory service is running" };
    }

    async getLowStockItems() {
        const repo = AppDataSource.getRepository(Inventory);

        return await repo
            .createQueryBuilder("inv")
            .leftJoinAndSelect("inv.product", "product")
            .where("inv.quantity <= inv.min_stock")
            .getMany();
    }

    async notifyLowStockToAdmins() {
        const lowStockItems = await this.getLowStockItems();

        if (!lowStockItems.length) {
            return { message: "No hay productos con stock mínimo" };
        }

        const ADMIN_ROLE_NAME = "ADMIN";

        const userRepo = AppDataSource.getRepository(User);
        const admins = await userRepo
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .where("role.name = :roleName", { roleName: ADMIN_ROLE_NAME })
            .getMany();

        for (const admin of admins) {
            for (const item of lowStockItems) {
                const msg = 'El producto ${item.product.name} tiene stock bajo. Cantidad: ${item.quantity}, mínimo: ${item.min_stock}';
                await this.notificationService.sendNotification(msg, admin.id_user);
            }
        }

        return {
            message: "Notificaciones de stock mínimo enviadas",
            totalAdmins: admins.length,
            totalLowStockProducts: lowStockItems.length,
        };
    }
}