const Product = require('../models/producto.model');

// OBTENER TODOS LOS PRODUCTOS (Read - All)
const getProductos = async (req, res) => {
    try {
        // Traemos de la base de datos toditos los productos registrados
        const productos = await Product.findAll();
        
        return res.status(200).json({
            ok: true,
            total: productos.length,
            data: productos
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Ups, ocurrió un error interno al buscar los productos."
        });
    }
};

// OBTENER UN PRODUCTO POR SU ID (Read - One)
const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Product.findByPk(id);

        // Si no existe, avisamos con un 404 para que el servicio de pedidos sepa que no se encontró
        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: `El producto con el ID ${id} no existe.`
            });
        }

        return res.status(200).json({
            ok: true,
            data: producto
        });
    } catch (error) {
        console.error("Error al buscar el producto:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno en el servidor al consultar el producto."
        });
    }
};

// CREAR UN NUEVO PRODUCTO (Create)
const createProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, existencia } = req.body;

        // Validamos que manden los campos obligatorios principales
        if (!nombre || precio === undefined || existencia === undefined) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos obligatorios (nombre, precio o existencia)."
            });
        }

        // Creamos el producto; las validaciones del modelo
        // se encargan de que precio > 0 y existencia >= 0
        const nuevoProducto = await Product.create({
            nombre,
            descripcion,
            precio,
            existencia
        });

        return res.status(201).json({
            ok: true,
            mensaje: "¡Producto creado con éxito!",
            data: nuevoProducto
        });
    } catch (error) {
        // Si Sequelize atrapa una regla de validación fallida, la devolvemos clara
        console.error("Error al crear producto:", error);
        return res.status(400).json({
            ok: false,
            mensaje: error.errors ? error.errors.map(e => e.message) : "Error al guardar el producto."
        });
    }
};

// ACTUALIZAR UN PRODUCTO (Update)
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, existencia } = req.body;

        const producto = await Product.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se puede actualizar. El producto con ID ${id} no existe.`
            });
        }

        // Actualizamos los campos si vienen en la petición
        await producto.update({
            nombre: nombre !== undefined ? nombre : producto.nombre,
            descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
            precio: precio !== undefined ? precio : producto.precio,
            existencia: existencia !== undefined ? existencia : producto.existencia
        });

        return res.status(200).json({
            ok: true,
            mensaje: "Producto actualizado correctamente",
            data: producto
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        return res.status(400).json({
            ok: false,
            mensaje: error.errors ? error.errors.map(e => e.message) : "Error al actualizar el producto."
        });
    }
};

// ELIMINAR UN PRODUCTO (Delete)
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Product.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: `Imposible eliminar. El producto con ID ${id} no fue encontrado.`
            });
        }

        await producto.destroy();

        return res.status(200).json({
            ok: true,
            mensaje: "Producto eliminado correctamente del sistema."
        });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno al intentar eliminar el producto."
        });
    }
};

// DESCONTAR EXISTENCIAS (Consumido por el servicio de pedidos)
const descontarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body; // Cantidad que el pedido quiere llevarse

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debes especificar una cantidad válida mayor a 0 para descontar."
            });
        }

        const producto = await Product.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: "El producto que intentas descontar no existe."
            });
        }

        // Validamos si hay suficiente stock en la bodega
        if (producto.existencia < cantidad) {
            return res.status(400).json({
                ok: false,
                mensaje: `Stock insuficiente. Stock actual: ${producto.existencia}, solicitado: ${cantidad}.`
            });
        }

        // Descontamos la existencia
        producto.existencia -= cantidad;
        await producto.save();

        return res.status(200).json({
            ok: true,
            mensaje: "Stock descontado con éxito para el pedido.",
            data: {
                id: producto.id,
                nombre: producto.nombre,
                nueva_existencia: producto.existencia
            }
        });

    } catch (error) {
        console.error("Error al descontar stock:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno al procesar el descuento de existencias."
        });
    }
};

const reponerStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body; // Cantidad que se va a devolver al inventario

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debes especificar una cantidad válida mayor a 0 para reponer."
            });
        }

        const producto = await Product.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: "El producto que intentas reponer no existe."
            });
        }

        // Sumamos de regreso la cantidad al stock actual
        producto.existencia += Number(cantidad);
        await producto.save();

        return res.status(200).json({
            ok: true,
            mensaje: "Stock repuesto con éxito por cancelación de pedido.",
            data: {
                id: producto.id,
                nombre: producto.nombre,
                nueva_existencia: producto.existencia
            }
        });

    } catch (error) {
        console.error("Error al reponer stock:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno al procesar la reposición de existencias."
        });
    }
};

module.exports = {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    descontarStock,
    reponerStock
};