import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoEntity } from './pedidos.entity';
import { DetallePedidoEntity } from './detalle-pedidos.entity';
import { CrearPedidoDto } from './dto/crear-pedido.dto';

@Injectable()
export class PedidosService {
    private readonly PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://localhost:3001/api/productos';

    constructor(
        @InjectRepository(PedidoEntity)
        private readonly pedidoRepository: Repository<PedidoEntity>,
        @InjectRepository(DetallePedidoEntity)
        private readonly detalleRepository: Repository<DetallePedidoEntity>,
    ) {}

    async findAll(): Promise<PedidoEntity[]> {
        return await this.pedidoRepository.find({ relations: { detalles: true } });
    }

    async findOne(id: number): Promise<PedidoEntity> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id },
            relations: { detalles: true }
        });

        if (!pedido) {
            throw new NotFoundException(`El pedido con ID ${id} no fue encontrado.`);
        }

        return pedido;
    }

    async create(crearPedidoDto: CrearPedidoDto): Promise<PedidoEntity> {
        const { cliente_id, items } = crearPedidoDto;

        if (!items || items.length === 0) {
            throw new BadRequestException('El pedido debe incluir al menos un producto.');
        }

        let totalCalculado = 0;
        const itemsConPrecioValidado: Array<{ producto_id: number; cantidad: number; precio_unitario: number }> = [];

        // 1. Validar existencias, stock y obtener el precio real desde el Servicio de Productos
        for (const item of items) {
            try {
                const response = await fetch(`${this.PRODUCTOS_URL}/${item.producto_id}`);
                
                if (!response.ok) {
                    throw new NotFoundException(`El producto con ID ${item.producto_id} no existe en el catálogo.`);
                }

                const productoData = await response.json();
                const producto = productoData.data;

                if (producto.existencia < item.cantidad) {
                    throw new BadRequestException(
                        `Stock insuficiente para '${producto.nombre}'. Disponible: ${producto.existencia}, solicitado: ${item.cantidad}`
                    );
                }

                const precioReal = Number(producto.precio);
                totalCalculado += precioReal * item.cantidad;

                itemsConPrecioValidado.push({
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                    precio_unitario: precioReal
                });

            } catch (error: any) {
                if (error instanceof BadRequestException || error instanceof NotFoundException) {
                    throw error;
                }
                throw new InternalServerErrorException(
                    `Error de comunicación con el Servicio de Productos: ${error.message}`
                );
            }
        }

        // 2. Descontar el stock en el Servicio de Productos
        for (const item of itemsConPrecioValidado) {
            try {
                const resDescuento = await fetch(`${this.PRODUCTOS_URL}/${item.producto_id}/descontar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cantidad: item.cantidad })
                });

                if (!resDescuento.ok) {
                    throw new InternalServerErrorException(
                        `Error al descontar stock del producto ID ${item.producto_id}`
                    );
                }
            } catch (error: any) {
                throw new InternalServerErrorException(
                    `Fallo al actualizar inventario en Productos: ${error.message}`
                );
            }
        }

        // 3. Crear y guardar el pedido con sus detalles y precios oficiales
        const nuevoPedido = this.pedidoRepository.create({
            cliente_id,
            estado: 'GENERADO',
            total: totalCalculado,
            detalles: itemsConPrecioValidado.map(item => this.detalleRepository.create({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario
            }))
        });

        return await this.pedidoRepository.save(nuevoPedido);
    }

async cambiarEstado(id: number, nuevoEstado: string): Promise<PedidoEntity> {
        const pedido = await this.findOne(id);
        const estadosValidos = ['GENERADO', 'PENDIENTE', 'ENTREGADO', 'CANCELADO'];

        if (!estadosValidos.includes(nuevoEstado)) {
            throw new BadRequestException(`Estado no válido. Debe ser uno de: ${estadosValidos.join(', ')}`);
        }

        // 1. REGLA DE SEGURIDAD: Si el pedido ya está cancelado, no se puede mover a ningún otro estado
        if (pedido.estado === 'CANCELADO') {
            throw new BadRequestException('No se puede modificar el estado de un pedido que ya ha sido cancelado.');
        }

        // 2. Opcional: Si ya fue entregado tampoco debería cancelarse o cambiarse (según tu lógica de negocio)
        if (pedido.estado === 'ENTREGADO') {
            throw new BadRequestException('No se puede modificar un pedido que ya fue entregado.');
        }

        // Lógica de devolución de stock si el pedido pasa a CANCELADO por primera vez
        if (nuevoEstado === 'CANCELADO' && pedido.estado !== 'CANCELADO') {
            for (const detalle of pedido.detalles) {
                try {
                    const response = await fetch(`${this.PRODUCTOS_URL}/${detalle.producto_id}/reponerStock`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cantidad: detalle.cantidad })
                    });

                    if (!response.ok) {
                        console.error(`Fallo al reponer stock del producto ID ${detalle.producto_id}`);
                    }
                } catch (error: any) {
                    console.error(`Error de comunicación al reponer stock del producto ${detalle.producto_id}:`, error.message);
                }
            }
        }

        pedido.estado = nuevoEstado;
        return await this.pedidoRepository.save(pedido);
    }
}