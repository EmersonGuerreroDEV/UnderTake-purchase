import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderDetail {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    price: number;

    @Column()
    quantity: number;

    @Column()
    total: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'statusId' })
    orderId: Order;

    @Column()
    productId: number;



    @Column()
    variantId: number;

}
