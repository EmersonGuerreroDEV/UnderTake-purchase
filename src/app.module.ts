import { Module } from '@nestjs/common';
import { OrderController } from './app.controller';
import { OrderService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order-details.entity';
import { Order } from './entities/order.entity';
import { Status } from './entities/status-id-entity';

@Module({
  imports: [ConfigModule.forRoot({
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
      entities: [Order, OrderDetail, Status], // Define tus entidades aquí
      synchronize: true, // Solo para desarrollo, desactívalo en producción
    }),
  }),
  TypeOrmModule.forFeature([Order, OrderDetail, Status]),],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule { }
