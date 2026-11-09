import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidosModule } from './pedidos/pedidos.module';
import { PedidoEntity } from './pedidos/pedidos.entity';
import { DetallePedidoEntity } from './pedidos/detalle-pedidos.entity';

@Module({
  imports: [
    // 1. Cargamos el archivo .env de forma global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configuramos TypeOrm usando ConfigService para leer el .env de manera segura
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [PedidoEntity, DetallePedidoEntity],
        synchronize: true,
      }),
    }),
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}