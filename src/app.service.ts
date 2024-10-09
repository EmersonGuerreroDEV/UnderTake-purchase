import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order-details.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { Status } from './entities/status-id-entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail) private orderDetailRepository: Repository<OrderDetail>,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, statusId, total, orderDetails } = createOrderDto;

    // Crear la orden principal
    const order = this.orderRepository.create({
      userId,
      total,
      statusId: { id: statusId } as Status, // Aquí estamos creando la referencia a la entidad Status
    });
    const savedOrder = await this.orderRepository.save(order);

    // Crear los detalles de la orden si existen
    if (orderDetails) {
      const orderDetailsEntities = orderDetails.map((detail) =>
        this.orderDetailRepository.create({
          ...detail,
          orderId: savedOrder, // Relacionar con la orden principal
        }),
      );
      await this.orderDetailRepository.save(orderDetailsEntities);
    }

    return savedOrder;
  }
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['statusId'] });
  }
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['statusId', 'orderDetails'], // Incluir detalles de la orden
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
  // async update(id: number, updateOrderDto: Partial<CreateOrderDto>): Promise<Order> {
  //   await this.orderRepository.update(id, updateOrderDto);
  //   return this.findOne(id);
  // }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
