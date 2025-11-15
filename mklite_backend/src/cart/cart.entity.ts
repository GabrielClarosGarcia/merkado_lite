import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { CartItem } from '../cart_item/cart_item.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id_cart: number;

  @ManyToOne(() => Customer, (customer) => customer.carts)
  @JoinColumn({ name: 'id_customer' })
  customer: Customer;

  @Column({ type: 'enum', enum: ['active', 'ordered'], default: 'active' })
  status: string;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}
