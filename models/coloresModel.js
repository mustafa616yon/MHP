// models/coloresModel.js
const { db } = require('../db/db');

const coloresModel = {
    getAllColores: function(callback) {
        const consulta = 'SELECT * FROM colores';
        db.query(consulta, (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    getColorById: function(id, callback) {
        const consulta = 'SELECT * FROM colores WHERE id = ?';
        db.query(consulta, [id], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    getColorByNombre: function(nombre, callback) {
        const consulta = 'SELECT id FROM colores WHERE nombre = ?';
        db.query(consulta, [nombre], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    createColor: function(colorData, callback) {
        const consulta = `
            INSERT INTO colores (nombre, tipo, precio, img, color, estado, alto, ancho, profundidad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            colorData.nombre,
            colorData.tipo,
            colorData.precio,
            colorData.img,
            colorData.color,
            colorData.estado || 'pendiente',
            colorData.alto,
            colorData.ancho,
            colorData.profundidad
        ];
        db.query(consulta, values, (error, result) => {
            if (error) {
                console.error('Error al crear el pedido en la base de datos:', error);
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    createMultipleColores: function(coloresDataArray, callback) {
        if (!Array.isArray(coloresDataArray) || coloresDataArray.length === 0) {
            return callback(null, []);
        }

        const values = coloresDataArray.map(colorData => [
            colorData.nombre,
            colorData.tipo,
            colorData.precio,
            colorData.imagen,
            colorData.color,
            'pendiente',
            colorData.alto,
            colorData.ancho,
            colorData.profundidad
        ]);

        const placeholders = coloresDataArray.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const consulta = `
            INSERT INTO colores (nombre, tipo, precio, img, color, estado, alto, ancho, profundidad)
            VALUES ${placeholders}
        `;

        const flatValues = values.flat();

        db.query(consulta, flatValues, (error, result) => {
            if (error) {
                console.error('Error al crear múltiples pedidos en la base de datos:', error);
                return callback(error, null);
            }
            callback(null, result);
        });
    },

    updateColor: function(id, colorData, callback) {
        let consulta = 'UPDATE colores SET ';
        const values = [];
        const updates = [];

        if (colorData.nombre !== undefined) {
            updates.push('nombre = ?');
            values.push(colorData.nombre);
        }
        if (colorData.tipo !== undefined) {
            updates.push('tipo = ?');
            values.push(colorData.tipo);
        }
        if (colorData.precio !== undefined) {
            updates.push('precio = ?');
            values.push(colorData.precio);
        }
        if (colorData.img !== undefined) {
            updates.push('img = ?');
            values.push(colorData.img);
        }
        if (colorData.color !== undefined) {
            updates.push('color = ?');
            values.push(colorData.color);
        }
        if (colorData.estado !== undefined) {
            updates.push('estado = ?');
            values.push(colorData.estado);
        }
        // Añadiendo las nuevas columnas
        if (colorData.alto !== undefined) {
            updates.push('alto = ?');
            values.push(colorData.alto);
        }
        if (colorData.ancho !== undefined) {
            updates.push('ancho = ?');
            values.push(colorData.ancho);
        }
        if (colorData.profundidad !== undefined) {
            updates.push('profundidad = ?');
            values.push(colorData.profundidad);
        }

        consulta += updates.join(', ');
        consulta += ' WHERE id = ?';
        values.push(id);

        db.query(consulta, values, (error, result) => {
            if (error) {
                console.error('Error al actualizar el pedido en la base de datos:', error);
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    },

    deleteColor: function(id, callback) {
        const consulta = 'DELETE FROM colores WHERE id = ?';
        db.query(consulta, [id], (error, result) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, result);
        });
    }
};

module.exports = coloresModel;