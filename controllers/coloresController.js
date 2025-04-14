const express = require('express');
const router = express.Router();
const coloresModel = require('../models/coloresModel');

// Definir las rutas y asociarlas a las funciones del modelo

router.get('/', (req, res) => {
    coloresModel.getAllColores((error, colores) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al obtener los pedidos', error: error.message });
        }
        res.json(colores);
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    coloresModel.getColorById(id, (error, color) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al obtener el pedido', error: error.message });
        }
        if (!color) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.json(color);
    });
});

router.get('/nombre/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    coloresModel.getColorByNombre(nombre, (error, colorId) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al obtener el ID del pedido', error: error.message });
        }
        if (!colorId || colorId.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.json(colorId[0]);
    });
});

router.post('/', (req, res) => {
    const detallesPedido = req.body;
    console.log('Datos recibidos en /colores para crear pedidos:', detallesPedido);

    if (!detallesPedido || !detallesPedido.productos || !Array.isArray(detallesPedido.productos) || detallesPedido.productos.length === 0) {
        return res.status(400).send({ mensaje: 'No se proporcionaron productos en el carrito.' });
    }

    const productosCarrito = detallesPedido.productos.map(producto => ({
        nombre: producto.nombre,
        tipo: producto.tipo,
        precio: producto.precio,
        img: producto.imagen,
        color: producto.color,
        alto: producto.alto,
        ancho: producto.ancho,
        profundidad: producto.profundidad
    }));

    coloresModel.createMultipleColores(productosCarrito, (error, result) => {
        if (error) {
            console.error('Error al crear los pedidos:', error);
            return res.status(500).send({ mensaje: 'Error al crear los pedidos', error: error.message });
        }
        res.status(201).send({ mensaje: `${result.affectedRows} pedido(s) creado(s) correctamente`, results: result });
    });
});

router.post('/single', (req, res) => {
    const colorData = req.body;
    coloresModel.createColor(colorData, (error, result) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
        }
        res.status(201).json({ mensaje: 'Pedido creado correctamente', insertId: result.insertId });
    });
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const colorData = req.body;
    coloresModel.updateColor(id, colorData, (error, result) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar el pedido', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.json({ mensaje: 'Pedido actualizado correctamente', affectedRows: result.affectedRows });
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    coloresModel.deleteColor(id, (error, result) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al eliminar el pedido', error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.json({ mensaje: 'Pedido eliminado correctamente', affectedRows: result.affectedRows });
    });
});

module.exports = router;