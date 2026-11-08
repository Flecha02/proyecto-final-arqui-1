import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PedidoEntity } from './pedidos.entity';
import { DetallePedidoEntity } from './detalle-pedidos.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([PedidoEntity, DetallePedidoEntity])
],
    controllers: [PedidosController],
    providers: [PedidosService],
})
export class PedidosModule {}