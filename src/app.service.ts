import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order-details.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { Status } from './entities/status-id-entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BinancePaymentResponseInterface, Checkout, OpenpayResponse } from './interfaces/checkout.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject('CHECKOUT_SERVICE') private readonly checkoutService: ClientProxy,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail) private orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(PaymentMethod) private paymentMethodRepository: Repository<PaymentMethod>,
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Checkout> {
    const { userId, statusId, total, orderDetails, address, cityId, paymentMethod } = createOrderDto;

    // Crear la orden principal
    const order = this.orderRepository.create({
      userId,
      total,
      address,
      cityId,
      paymentMethod: { id: paymentMethod } as PaymentMethod,
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

    if (createOrderDto.paymentMethod === 1) {
      const openpayResponse: OpenpayResponse = await lastValueFrom(
        this.checkoutService.send(
          { cmd: "openpay-checkout" }, // Mensaje de comando
          {
            amount: createOrderDto.total,
            currency: "COP",
            description: "Compra de productos",
            redirect_url: `http://localhost:3000/purchases/${savedOrder.id}`,
            order_id: savedOrder.id,
            send_email: true,
            customer: {
              name: "prueba",
              last_name: "prueba",
              phone_number: "3000000000",
              email: "prueba@yopmail.com",
            },
          }
        )
      );
      return { urlRedirect: openpayResponse.checkout_link };
    } else {

      const binanceResponse: BinancePaymentResponseInterface = await lastValueFrom(this.checkoutService.send({ cmd: "binance-checkout" }, { id: savedOrder.id, amount: savedOrder.total }))

      console.log(binanceResponse)
      return { urlRedirect: binanceResponse.checkoutUrl }
    }

  }
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['statusId'] });
  }

  async findOne(id: number): Promise<Order> {
    // Busca la orden
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['statusId', 'orderDetails'], // Incluir detalles de la orden
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Enriquecer la orden con detalles del producto
    const orderDetailsWithProducts = await Promise.all(
      order.orderDetails.map(async (detail) => {
        const product = await lastValueFrom(
          this.productsClient.send({ cmd: 'get-get_product_by_id' }, { productId: detail.productId, variantId: detail.variantId })
        );


        return {
          ...detail,
          product, // Aquí agregas la información del producto
        };
      })
    );

    return {
      ...order,
      orderDetails: orderDetailsWithProducts, // Reemplaza con detalles enriquecidos
    };
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

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find();
  }
}
