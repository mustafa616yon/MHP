// mhpController.js
const express = require('express');
const router = express.Router();
const mhpModel = require('../models/mhpModel');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/'), // Cambiar a public/img
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function handleTable(tabla) {
    const actions = {
        getAll: (req, res) => {
            console.log(`[${tabla}] getAll: Iniciando consulta a la base de datos`);
            mhpModel.getAllProductos(tabla, (error, result) => {
                if (error) {
                    console.log(`[${tabla}] getAll: Error en la consulta`, error);
                    res.status(500).send('error al cargar recursos');
                    return;
                }
                console.log(`[${tabla}] getAll: Consulta exitosa, resultados:`, result);
                res.send({ productos: result });
            });
            console.log(`[${tabla}] getAll: Consulta a la base de datos iniciada`);
        },

        getById: (req, res) => {
            mhpModel.getProductoById(tabla, req.params.id, (error, result) => {
                if (error) {
                    console.log("error al cargar ID", error);
                    res.status(500).send('error al cargar ID');
                    return;
                }
                res.send({ producto: result[0] });
            });
        },

        getByNombre: (req, res) => {
            mhpModel.getProductoByNombre(tabla, req.params.nombre, (error, result) => {
                if (error) {
                    console.log("error al cargar nombre", error);
                    res.status(500).send('error al cargar nombre');
                    return;
                }
                if (!result || result.length === 0) {
                    res.status(404).send('producto no encontrado');
                    return;
                }
                res.send({ producto: result[0] });
            });
        },

        create: (req, res) => {
            console.log("Datos del formulario:", req.body);
            const productoData = {
                nombre: req.body.nombre,
                tipo: req.body.tipo,
                alto: req.body.alto, // Nuevas columnas
                ancho: req.body.ancho, // Nuevas columnas
                profundidad: req.body.profundidad, // Nuevas columnas
                precio: req.body.precio,
                img: req.file ? req.file.filename : 'wood', // Valor por defecto si no hay archivo
            };
            mhpModel.createProducto(tabla, productoData, (error, result) => {
                if (error) {
                    console.error('Error al crear producto:', error);
                    res.status(500).send({ mensaje: "Error al guardar el producto." });
                    return;
                }
                res.send({ mensaje: 'Producto creado correctamente' });
            });
        },

        update: (req, res) => {
            console.log("Actualizando producto con ID:", req.params.id);
            console.log("Datos a actualizar:", req.body);
            const productoData = {
                nombre: req.body.nombre,
                tipo: req.body.tipo,
                alto: req.body.alto, // Nuevas columnas
                ancho: req.body.ancho, // Nuevas columnas
                profundidad: req.body.profundidad, // Nuevas columnas
                precio: req.body.precio,
                img: req.body.img, // Recibe el nombre del archivo
            };
            mhpModel.updateProducto(tabla, req.params.id, productoData, (error, result) => {
                if (error) {
                    console.error('Error al actualizar producto:', error);
                    res.status(500).send({ mensaje: "Error al actualizar el producto." });
                    return;
                }
                res.send({ mensaje: 'Producto actualizado correctamente' });
            });
        },

        delete: (req, res) => {
            mhpModel.deleteProducto(tabla, req.params.id, (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('error al eliminar');
                    return;
                }
                res.send({ mensaje: "producto eliminado" });
            });
        }
    };
    return actions;
}

['comedor', 'mesa-tv', 'mesa-centro', 'mesa-noche', 'peinadora'].forEach(tabla => {
    const actions = handleTable(tabla);

    router.get(`/${tabla}`, actions.getAll);
    router.get(`/${tabla}/:id`, actions.getById);
    router.get(`/${tabla}/nombre/:nombre`, actions.getByNombre);
    router.post(`/${tabla}`, upload.single('img'), actions.create); // Usar multer aquí
    router.put(`/${tabla}/:id`, upload.single('img'), actions.update); // También en update
    router.delete(`/${tabla}/:id`, actions.delete);
});

module.exports = router;