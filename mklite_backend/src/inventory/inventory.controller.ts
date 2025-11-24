import { Controller, Get, Patch, Body, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update_inventory.dto';

@Controller('/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory() {
    return this.inventoryService.getAllInventory();
  }

  @Get('/:productId')
  async getProductStock(@Param('productId') productId: number) {
    return this.inventoryService.getStockByProduct(productId);
  }

  @Patch()
  async updateStock(@Body() dto: UpdateInventoryDto) {
    return this.inventoryService.updateStock(dto);
  }

  @Get("status")
    getStatus() {
        return this.inventoryService.getInventoryStatus();
    }

    @Get("low-stock")
    getLowStock() {
        return this.inventoryService.getLowStockItems();
    }

    @Get('/check-expirations')
  async checkExpirations() {
    return this.inventoryService.checkExpirations();
  }
}
