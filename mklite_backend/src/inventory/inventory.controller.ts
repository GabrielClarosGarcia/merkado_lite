import { Controller, Get, Patch, Body, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update_inventory.dto';
import { Query } from '@nestjs/common';
import { FilterExpirationDto } from './dto/filter_expiration.dto';

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

  @Get('/expiring-products')
  async getExpiringProducts(@Query() filter: FilterExpirationDto) {
    return this.inventoryService.getProductsByExpiration(filter.status);
  }
}
