import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetallePedidoEntity } from './detalle-pedidos.entity';

@Entity('pedidos')
export class PedidoEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ type: 'int', name: 'cliente_id' })
    cliente_id: number;

    @Column({ 
        type: 'enum', 
        enum: ['GENERADO', 'PENDIENTE', 'ENTREGADO', 'CANCELADO'], 
        default: 'GENERADO' 
    })
    estado: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    // Relación uno a muchos con los detalles del pedido
    @OneToMany(() => DetallePedidoEntity, (detalle) => detalle.pedido, { cascade: true })
    detalles: DetallePedidoEntity[];
}