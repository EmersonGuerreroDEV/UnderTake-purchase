import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { OrderService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateOrderDto: Partial<CreateOrderDto>,
  // ): Promise<Order> {
  //   return this.orderService.update(id, updateOrderDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
