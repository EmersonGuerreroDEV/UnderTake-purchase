import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Status } from './status-id-entity';
import { OrderDetail } from './order-details.entity';
import { PaymentMethod } from './payment-method.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @ManyToOne(() => Status)
    @JoinColumn({ name: 'statusId' })
    statusId: Status;

    @ManyToOne(() => PaymentMethod)  // Relación con la entidad PaymentMethod
    @JoinColumn({ name: 'paymentMethodId' })
    paymentMethod: PaymentMethod;


    @Column()
    total: number;


    @Column()
    cityId: string

    @Column()
    address: string

    // Relación con OrderDetail
    @OneToMany(() => OrderDetail, orderDetail => orderDetail.orderId) // Asegúrate de que esta línea esté presente
    orderDetails: OrderDetail[];


    // Timestamps automáticos
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;


    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
