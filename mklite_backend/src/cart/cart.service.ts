import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/data-source";

@Injectable()
export class CartService {
    async getCartItems() {
        return await AppDataSource.manager.find('CartItem');
    }

    addItemToCart(item: any) {
        // Lógica para agregar un ítem al carrito
    }

    removeItemFromCart(itemId: number) {
        // Lógica para eliminar un ítem del carrito
    }

    clearCart() {
        // Lógica para vaciar el carrito
    }
}