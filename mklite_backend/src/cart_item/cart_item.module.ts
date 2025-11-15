import { Module } from "@nestjs/common";
import { CartItemController } from "./cart_item.controller";
import { CartItemService } from "./cart_item.service";

@Module({
    imports: [],
    controllers: [CartItemController],
    providers: [CartItemService],
})
export class CartItemModule {}