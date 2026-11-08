import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
    @IsInt({ message: "El ID del producto debe ser un número entero." })
    @IsPositive({ message: "El ID del producto debe ser válido." })
    producto_id: number;

    @IsInt({ message: "La cantidad debe ser un número entero." })
    @IsPositive({ message: "La cantidad debe ser mayor a 0." })
    cantidad: number;
}

export class CrearPedidoDto {
    @IsInt({ message: "El ID del cliente debe ser un número entero." })
    @IsPositive({ message: "El ID del cliente es obligatorio." })
    cliente_id: number;

    @IsArray({ message: "Los items del pedido deben enviarse en una lista (array)." })
    @ValidateNested({ each: true })
    @Type(() => ItemPedidoDto)
    items: ItemPedidoDto[];
}