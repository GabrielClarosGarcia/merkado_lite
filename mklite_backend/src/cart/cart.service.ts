import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { Cart } from "./cart.entity";
import { AddToCartDto } from "./dto/add_to_cart.dto";
import { CartItem } from "src/cart_item/cart_item.entity";
import { UpdateCartItemDto } from "./dto/update_cart_item.dto";
import { Product } from "src/product/product.entity";
import { Customer } from "src/customer/customer.entity";


@Injectable()
export class CartService {
    async getCart(customerId: number) {
        let cart = await AppDataSource.manager.findOne(Cart, {
            where: { customer: { id_customer: customerId }, status: 'active' },
            relations: ['items', 'items.product'],
        });

        if(!cart) {
            const customer = await AppDataSource.manager.findOneBy(Customer, { id_customer: customerId });
            if (!customer) throw new Error('Cliente no encontrado');
            
            cart = AppDataSource.manager.create(Cart, {customer, status: 'active', items: [] });
            await AppDataSource.manager.save(Cart, cart);
        }

        return cart;
    }
    
    async addToCart(customerId: number, dto: AddToCartDto) {
        const cart = await this.getCart(customerId);

        const product = await AppDataSource.manager.findOneBy(Product, { id_product: dto.productId });
        if (!product) throw new Error('Producto no encontrado');

        let item = cart.items.find(i => i.product.id_product === product.id_product);
        if(item) {
            item.quantity += dto.quantity;
        } else {
            item = AppDataSource.manager.create(CartItem, {cart, product, quantity: dto.quantity });
            cart.items.push(item);
        }

        await AppDataSource.manager.save(CartItem, item);
        return cart;
    }

    async updateCartItem(customerId: number, itemId: number, dto: UpdateCartItemDto) {
        const cart = await this.getCart(customerId);

        const item = cart.items.find(i => i.id_cart_item === itemId);
        if(!item) {
            throw new Error('Cart item not found');
        }

        item.quantity = dto.quantity;
        await AppDataSource.manager.save(CartItem, item);
        return cart;
    }

    async removeCartItem(customerId: number, itemId: number) {
        const cart = await this.getCart(customerId);

        const item = cart.items.find(i => i.id_cart_item === itemId);
        if(!item) {
            throw new Error('Cart item not found');
        }
        
        await AppDataSource.manager.remove(CartItem, item);
        return cart;
    }

}