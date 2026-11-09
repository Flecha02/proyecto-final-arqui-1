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

    // 2. Configuramos TypeOrm usando DATABASE_URL y SSL para Supabase Pooler
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // Usamos la URL del pooler
        entities: [PedidoEntity, DetallePedidoEntity],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false, // Requerido para conexiones externas en Supabase
        },
      }),
    }),
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}