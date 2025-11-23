import { Controller, Get, Post } from "@nestjs/common";
import { InventoryService } from "./inventory.service";

@Controller("/inventory")
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService,
    ) {}

    @Get("status")
    getStatus() {
        return this.inventoryService.getInventoryStatus();
    }

    @Get("low-stock")
    getLowStock() {
        return this.inventoryService.getLowStockItems();
    }

    @Post("notify-low-stock")
    notifyLowStock() {
        return this.inventoryService.notifyLowStockToAdmins();
    }
}