const { db } = require('../db/db');

const mhpModel = {
    getAllProductos: function (tabla, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta getAllProductos`);
        const consulta = `SELECT id, nombre, tipo, alto, ancho, profundidad, precio, img FROM \`${tabla}\``;
        db.query(consulta, (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en getAllProductos`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta getAllProductos exitosa`);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta getAllProductos iniciada`);
    },

    getProductoById: function (tabla, id, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta getProductoById`);
        const consulta = `SELECT id, nombre, tipo, alto, ancho, profundidad, precio, img FROM \`${tabla}\` WHERE id = ?`;
        db.query(consulta, [id], (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en getProductoById`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta getProductoById exitosa`);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta getProductoById iniciada`);
    },

    getProductoByNombre: function (tabla, nombre, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta getProductoByNombre`);
        const consulta = `SELECT id, nombre, tipo, alto, ancho, profundidad, precio, img FROM \`${tabla}\` WHERE nombre = ?`;
        db.query(consulta, [nombre], (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en getProductoByNombre`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta getProductoByNombre exitosa`);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta getProductoByNombre iniciada`);
    },

    createProducto: function (tabla, productoData, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta createProducto`);
        const consulta = `
            INSERT INTO \`${tabla}\` (nombre, tipo, alto, ancho, profundidad, precio, img)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            productoData.nombre,
            productoData.tipo,
            productoData.alto,
            productoData.ancho,
            productoData.profundidad,
            productoData.precio,
            productoData.img,
        ];
        db.query(consulta, values, (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en createProducto`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta createProducto exitosa`);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta createProducto iniciada`);
    },

    updateProducto: function (tabla, id, productoData, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta updateProducto`);
        console.log(`[${tabla}] mhpModel: ID a actualizar:`, id);
        console.log(`[${tabla}] mhpModel: Datos a actualizar:`, productoData);
        const consulta = `
            UPDATE \`${tabla}\` SET
                nombre = ?,
                tipo = ?,
                alto = ?,
                ancho = ?,
                profundidad = ?,
                precio = ?,
                img = ?
            WHERE id = ?
        `;
        const values = [
            productoData.nombre,
            productoData.tipo,
            productoData.alto,
            productoData.ancho,
            productoData.profundidad,
            productoData.precio,
            productoData.img,
            id,
        ];
        db.query(consulta, values, (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en updateProducto`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta updateProducto exitosa`);
            console.log(`[${tabla}] mhpModel: Resultado de la actualización:`, result);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta updateProducto iniciada`);
    },

    deleteProducto: function (tabla, id, callback) {
        console.log(`[${tabla}] mhpModel: Iniciando consulta deleteProducto`);
        const consulta = `DELETE FROM \`${tabla}\` WHERE id = ?`;
        db.query(consulta, [id], (error, result) => {
            if (error) {
                console.log(`[${tabla}] mhpModel: Error en deleteProducto`, error);
                callback(error, null);
                return;
            }
            console.log(`[${tabla}] mhpModel: Consulta deleteProducto exitosa`);
            callback(null, result);
        });
        console.log(`[${tabla}] mhpModel: Consulta deleteProducto iniciada`);
    },
};

module.exports = mhpModel;