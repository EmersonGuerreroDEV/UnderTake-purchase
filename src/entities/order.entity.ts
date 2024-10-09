import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Status } from './status-id-entity';
import { OrderDetail } from './order-details.entity';


@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => Status)
    @JoinColumn({ name: 'statusId' })
    statusId: Status;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;


    // Relación con OrderDetail
    @OneToMany(() => OrderDetail, orderDetail => orderDetail.orderId) // Asegúrate de que esta línea esté presente
    orderDetails: OrderDetail[];

    // Timestamps automáticos
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;


    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
