import { Module } from '@nestjs/common';
import { OrderController } from './app.controller';
import { OrderService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order-details.entity';
import { Order } from './entities/order.entity';
import { Status } from './entities/status-id-entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHECKOUT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3012, // Puerto del servicio de auth
        },

      },
      {
        name: 'PRODUCTS_SERVICE', // Nombre del cliente
        transport: Transport.TCP,
        options: {
          host: 'localhost', // Dirección del microservicio de productos
          port: 3002, // Puerto del microservicio de productos
        },
      },]),
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('host'),
        port: configService.get<number>('database.port') || 3306, // Asegúrate de usar el puerto correcto
        username: configService.get<string>('username'),
        password: configService.get<string>('password'),
        database: configService.get<string>('database'),
        // Si usas una URL en lugar de los campos separados:
        // url: configService.get<string>('database.url'),
        entities: [Order, OrderDetail, Status, PaymentMethod], // Define tus entidades aquí
        synchronize: true, // Solo para desarrollo, desactívalo en producción
      }),
    }),
    TypeOrmModule.forFeature([Order, OrderDetail, Status, PaymentMethod]),],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule { }
