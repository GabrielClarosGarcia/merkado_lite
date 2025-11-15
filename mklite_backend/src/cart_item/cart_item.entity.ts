import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from '../cart/cart.entity';
import { Product } from '../product/product.entity';

@Entity('cart_item')
export class CartItem {
  @PrimaryGeneratedColumn()
  id_cart_item: number;

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'id_cart' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @Column()
  quantity: number;
}
