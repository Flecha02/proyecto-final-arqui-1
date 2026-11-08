import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PedidoEntity } from './pedidos.entity';

@Entity('detalle_pedidos')
export class DetallePedidoEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ type: 'int', name: 'pedido_id' })
    pedido_id: number;

    @Column({ type: 'int', name: 'producto_id' })
    producto_id: number;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_unitario' })
    precio_unitario: number;

    // Relación inversa hacia la cabecera del pedido
    @ManyToOne(() => PedidoEntity, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido: PedidoEntity;
}