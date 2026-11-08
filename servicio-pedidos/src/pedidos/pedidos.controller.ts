import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CrearPedidoDto } from './dto/crear-pedido.dto';

@Controller('pedidos')
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}

    // GET /pedidos
    @Get()
    obtenerTodos() {
        return this.pedidosService.findAll();
    }

    // GET /pedidos/:id
    @Get(':id')
    obtenerPorId(@Param('id', ParseIntPipe) id: number) {
        return this.pedidosService.findOne(id);
    }

    // POST /pedidos
    @Post()
    crearPedido(@Body() crearPedidoDto: CrearPedidoDto) {
        return this.pedidosService.create(crearPedidoDto);
    }

    // PATCH /pedidos/:id/estado
    @Patch(':id/estado')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body('estado') estado: string
    ) {
        return this.pedidosService.cambiarEstado(id, estado);
    }
}