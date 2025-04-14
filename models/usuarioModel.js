//usuarioModel.js
const { db } = require('../db/db');

const usuarioModel = {
    getAllUsuarios: async function() {
        const consulta = 'SELECT * FROM usuarios';
        return new Promise((resolve, reject) => {
            db.query(consulta, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    },

    getUsuarioById: async function(id) {
        const consulta = 'SELECT * FROM usuarios WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.query(consulta, [id], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    },

    getUsuarioByCorreo: async function(correo) {
        const consulta = 'SELECT * FROM usuarios WHERE correo = ?';
        return new Promise((resolve, reject) => {
            db.query(consulta, [correo], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (result.length === 0) {
                    resolve(null); // Usuario no encontrado
                    return;
                }
                resolve(result[0]); // Devuelve el primer usuario encontrado
            });
        });
    },

    createUsuario: async function(usuarioData) {
        const consulta = `
            INSERT INTO usuarios (nombre, apellido, correo, telefono, cedula, direccion, contrasena, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            usuarioData.nombre,
            usuarioData.apellido,
            usuarioData.correo,
            usuarioData.telefono,
            usuarioData.cedula,
            usuarioData.direccion,
            usuarioData.contrasena,
            usuarioData.rol // <-- Agregar el rol
        ];
        return new Promise((resolve, reject) => {
            db.query(consulta, values, (error, result) => {
                if (error) {
                    console.log(error); // Log the error
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    },

    updateUsuario: async function(id, usuarioData) {
        const consulta = `
            UPDATE usuarios SET 
                nombre = ?,
                apellido = ?,
                correo = ?,
                telefono = ?,
                cedula = ?,
                direccion = ?,
                contrasena = ?,
                rol = ?
            WHERE id = ?
        `;
        const values = [
            usuarioData.nombre,
            usuarioData.apellido,
            usuarioData.correo,
            usuarioData.telefono,
            usuarioData.cedula,
            usuarioData.direccion,
            usuarioData.contrasena,
            usuarioData.rol,
            id,
        ];
        return new Promise((resolve, reject) => {
            db.query(consulta, values, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    },

    deleteUsuario: async function(id) {
        const consulta = 'DELETE FROM usuarios WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.query(consulta, [id], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    },

    getUsuarioByRol: async function(rol) {
        const consulta = 'SELECT * FROM usuarios WHERE rol = ?';
        return new Promise((resolve, reject) => {
            db.query(consulta, [rol], (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (result.length === 0) {
                    resolve(null);
                    return;
                }
                resolve(result[0]);
            });
        });
    },

    getUltimoId: async function() {
        const consulta = 'SELECT MAX(id) AS ultimoId FROM usuarios';
        return new Promise((resolve, reject) => {
            db.query(consulta, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result[0].ultimoId);
            });
        });
    }
};

module.exports = usuarioModel;