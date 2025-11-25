import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity('promotion')
export class Promotion {
  @PrimaryGeneratedColumn()
  id_promotion: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['percentage', 'fixed', 'buy_x_get_y'] })
  discount_type: string;

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  value: number; 

  @Column({ type: 'int', nullable: true })
  buy_x?: number;

  @Column({ type: 'int', nullable: true })
  get_y?: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'active', 'expired'],
    default: 'scheduled',
  })
  status: string;

  @ManyToMany(() => Product, (product) => product.promotions)
  @JoinTable({
    name: 'promotion_products',
    joinColumn: { name: 'id_promotion' },
    inverseJoinColumn: { name: 'id_product' },
  })
  products: Product[];

  @Column({ type: 'boolean', default: false })
is_auto: boolean;
}
