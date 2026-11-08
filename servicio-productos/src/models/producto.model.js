const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre del producto no puede estar vacío." }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: { msg: "El precio debe ser un número decimal válido." },
            min: {
                args: [0.01],
                msg: "El precio debe ser mayor a 0." // Regla de negocio del proyecto
            }
        }
    },
    existencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "La existencia debe ser un número entero." },
            min: {
                args: [0],
                msg: "La existencia no puede ser negativa (debe ser mayor o igual a 0)." // Regla de negocio
            }
        }
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Product;