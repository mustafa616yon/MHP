const { db } = require('../db/db');

const pagosModel = {
    getAllPagos: function (callback) {
        const consulta = 'SELECT id, monto, `numero-referencia`, nombre, apellido, fecha, cedula, producto, estado FROM pagos';
        db.query(consulta, (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    getPagoById: function (id, callback) {
        const consulta = 'SELECT id, monto, `numero-referencia`, nombre, apellido, fecha, cedula, producto, estado FROM pagos WHERE id = ?';
        db.query(consulta, [id], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    createPago: function (pagoData, callback) {
        const consulta = `
            INSERT INTO pagos (monto, \`numero-referencia\`, nombre, apellido, fecha, cedula, producto, estado)
            VALUES (?, ?, ?, ?, NOW(), ?, ?, DEFAULT)
        `;
        const values = [
            pagoData.monto,
            pagoData['numero-referencia'],
            pagoData.nombre,
            pagoData.apellido,
            pagoData.cedula,
            pagoData.producto, // Asegúrate de que pagoData contenga la propiedad 'producto'
        ];
        db.query(consulta, values, (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    updatePago: function (id, pagoData, callback) {
        const consulta = `
            UPDATE pagos SET
                monto = ?,
                \`numero-referencia\` = ?,
                nombre = ?,
                apellido = ?,
                fecha = NOW(),
                cedula = ?,
                producto = ?,
                estado = ?
            WHERE id = ?
        `;
        const values = [
            pagoData.monto,
            pagoData['numero-referencia'],
            pagoData.nombre,
            pagoData.apellido,
            pagoData.cedula,
            pagoData.producto, // Asegúrate de que pagoData contenga la propiedad 'producto'
            pagoData.estado,   // Asegúrate de que pagoData contenga la propiedad 'estado'
            id,
        ];
        db.query(consulta, values, (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    deletePago: function (id, callback) {
        const consulta = 'DELETE FROM pagos WHERE id = ?';
        db.query(consulta, [id], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    updatePagoEstado: function (id, estado, callback) {
        const consulta = 'UPDATE pagos SET estado = ? WHERE id = ?';
        db.query(consulta, [estado, id], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },
};

module.exports = pagosModel;