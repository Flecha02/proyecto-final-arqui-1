const { Router } = require('express');
const {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    descontarStock,
    reponerStock
} = require('../controllers/producto.controller');

const router = Router();

// Rutas del CRUD de Productos
router.get('/', getProductos);              // Obtener todos
router.get('/:id', getProductoById);        // Obtener uno por ID
router.post('/', createProducto);           // Crear nuevo producto
router.put('/:id', updateProducto);         // Actualizar producto
router.delete('/:id', deleteProducto);      // Eliminar producto

// Ruta especial requerida para el servicio de pedidos (descontar inventario)
router.patch('/:id/descontar', descontarStock);
router.patch('/:id/reponerStock', reponerStock)

module.exports = router;