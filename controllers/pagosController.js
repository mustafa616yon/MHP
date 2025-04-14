const express = require('express');
const router = express.Router();
const pagosModel = require('../models/pagosModel');
const coloresModel = require('../models/coloresModel'); // Importa el modelo de colores

// Obtener todos los pagos
router.get('/', (req, res) => {
    pagosModel.getAllPagos((error, result) => {
        if (error) {
            return res.status(500).send({
                mensaje: 'Error al obtener los pagos',
                error
            });
        }
        res.send({
            pagos: result
        });
    });
});

// Obtener un pago por ID
router.get('/:id', (req, res) => {
    pagosModel.getPagoById(req.params.id, (error, result) => {
        if (error) {
            return res.status(500).send({
                mensaje: 'Error al obtener el pago',
                error
            });
        }
        if (!result || result.length === 0) {
            return res.status(404).send({
                mensaje: 'Pago no encontrado'
            });
        }
        res.send({
            pago: result[0]
        });
    });
});

// Crear un nuevo pago y procesar los productos
router.post('/', (req, res) => {
    const pagoData = req.body.pago;
    const productos = req.body.detalles_pedido; // Usar 'detalles_pedido' como lo envías desde el frontend

    console.log("pagoData:", pagoData);
    console.log("productos:", productos);

    pagosModel.createPago({ ...pagoData, producto: JSON.stringify(productos) }, (error, resultPago) => {
        if (error) {
            console.error("Error al crear el pago:", error);
            return res.status(500).send({
                mensaje: 'Error al crear el pago',
                error
            });
        }

        const pagoId = resultPago.insertId;

        if (productos && Array.isArray(productos)) {
            productos.forEach(producto => {
                if (!producto) {
                    console.error('Error: Se encontró un producto undefined o null en el array de productos.');
                    return; // Saltar este elemento y continuar
                }

                const colorData = {
                    nombre: producto.nombre,
                    tipo: producto.tipo,
                    precio: producto.precio,
                    img: producto.imagen,
                    color: producto.color,
                    estado: 'pendiente',
                    alto: producto.alto,
                    ancho: producto.ancho,
                    profundidad: producto.profundidad
                    // Puedes incluir el pagoId aquí si deseas relacionar directamente el pedido con el pago
                    // pago_id: pagoId
                };

                // **SIMPLEMENTE CREA EL COLOR (PEDIDO) SIN VERIFICAR SI EXISTE**
                coloresModel.createColor(colorData, (error, createResult) => {
                    if (error) {
                        console.error('Error al crear el color (pedido):', error);
                        return;
                    }
                    console.log("Pedido creado para", producto.nombre, ":", createResult);
                });
            });
        } else {
            console.warn('Advertencia: No se recibieron productos para procesar o no es un array.');
        }

        // Obtener los datos del pago recién creado
        pagosModel.getPagoById(pagoId, (errorPagoRecuperado, pagoResult) => {
            if (errorPagoRecuperado) {
                console.error('Error al obtener el pago recién creado:', errorPagoRecuperado);
                return res.status(500).send({
                    mensaje: 'Error al obtener el pago recién creado',
                    error: errorPagoRecuperado
                });
            }

            // Enviar los datos del pago recién creado en la respuesta
            res.status(201).send({
                mensaje: 'Pago creado correctamente',
                pago: pagoResult[0]
            });
        });
    });
});

// Actualizar un pago existente
router.put('/:id', (req, res) => {
    const pagoData = {
        monto: req.body.monto,
        'numero-referencia': req.body['numero-referencia'],
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        cedula: req.body.cedula,
        producto: req.body.producto, // Asegúrate de que se envíe el producto si se va a actualizar
        estado: req.body.estado     // Asegúrate de que se envíe el estado si se va a actualizar
    };

    pagosModel.updatePago(req.params.id, pagoData, (error, result) => {
        if (error) {
            return res.status(500).send({
                mensaje: 'Error al actualizar el pago',
                error
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({
                mensaje: 'Pago no encontrado'
            });
        }
        res.send({
            mensaje: 'Pago actualizado correctamente'
        });
    });
});

// Eliminar un pago
router.delete('/:id', (req, res) => {
    pagosModel.deletePago(req.params.id, (error, result) => {
        if (error) {
            return res.status(500).send({
                mensaje: 'Error al eliminar el pago',
                error
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({
                mensaje: 'Pago no encontrado'
            });
        }
        res.send({
            mensaje: 'Pago eliminado correctamente'
        });
    });
});

// Actualizar el estado de un pago
router.put('/:id/estado', (req, res) => {
    const { estado } = req.body;
    const pagoId = req.params.id;

    if (!estado) {
        return res.status(400).send({ mensaje: 'El estado es requerido' });
    }

    pagosModel.updatePagoEstado(pagoId, estado, (error, result) => {
        if (error) {
            return res.status(500).send({ mensaje: 'Error al actualizar el estado del pago', error });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ mensaje: 'Pago no encontrado' });
        }
        res.send({ mensaje: 'Estado del pago actualizado correctamente' });
    });
});

module.exports = router;