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
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
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
            redirect_url: `${process.env.CLIENT_URL}/purchases/${savedOrder.id}`,
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
      return { urlRedirect: openpayResponse.checkout_link, order: savedOrder.id, noRedirect: false };
    } else {

      const binanceResponse: BinancePaymentResponseInterface = await lastValueFrom(this.checkoutService.send({ cmd: "binance-checkout" }, { id: savedOrder.id, amount: savedOrder.total }))


      return { urlRedirect: binanceResponse.checkoutUrl, order: savedOrder.id, noRedirect: true }
    }

  }
  async findAll(): Promise<Order[]> {


    const orders = await this.orderRepository.find({ relations: ['statusId', 'orderDetails', 'paymentMethod'] });

    const orderDetailsWithUser = await Promise.all(
      orders.map(async (order) => {
        // Hacer la petición para obtener la información del usuario
        const user = await lastValueFrom(
          this.authClient.send({ cmd: 'detail_admin_user' }, { user: { id: order.userId } })
        );

        // Combinar la información del pedido con la del usuario
        return {
          ...order,
          user, // Aquí agregas la información del usuario
        };
      })
    );

    return orderDetailsWithUser;
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

  async findAllMe(token: string): Promise<Order[]> {

    const result = await lastValueFrom(
      this.authClient.send({ cmd: 'validate_token' }, { token }) // Enviar el token al microservicio de autenticación
    );

    console.log(result)
    const orders = await this.orderRepository.find({
      where: { userId: result.sub },
      relations: ['statusId', 'orderDetails', 'paymentMethod'],
    })
    return orders
  }

}
