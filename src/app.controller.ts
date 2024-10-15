import { Controller, Get, Post, Body, Param, Delete, Put, Inject } from '@nestjs/common';
import { OrderService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { PaymentMethod } from './entities/payment-method.entity';
import { Checkout } from './interfaces/checkout.interface';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService
  ) { }

  @MessagePattern({ cmd: 'create-order' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Checkout> {
    return this.orderService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'get-orders' })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @MessagePattern({ cmd: 'get-order' })
  async findOne(@Body() data): Promise<Order> {
    const id = parseInt(data.orderId)
    return this.orderService.findOne(id);
  }






  @MessagePattern({ cmd: 'payment_method-order' })
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.orderService.getPaymentMethods();
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateOrderDto: Partial<CreateOrderDto>,
  // ): Promise<Order> {
  //   return this.orderService.update(id, updateOrderDto);
  // }

  @MessagePattern({ cmd: 'remove-order' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
