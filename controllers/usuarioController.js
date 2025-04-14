const express = require('express');
const router = express.Router();
const usuarioModel = require('../models/usuarioModel');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { db } = require('../db/db');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/verification');

// Función para crear el objeto usuarioData
function crearUsuarioData(req, rol) {
    return {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo,
        telefono: req.body.telefono,
        cedula: req.body.cedula,
        direccion: req.body.direccion,
        contrasena: req.body.contrasena,
        rol: rol || 'comun' // Establecer el rol por defecto como "comun"
    };
}

// Obtener todos los usuarios (PROTEGIDO SOLO PARA ADMINISTRADORES)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const result = await usuarioModel.getAllUsuarios();
        res.send({ usuarios: result });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).send({ mensaje: 'Error al obtener los usuarios', error });
    }
});

// Crear un nuevo usuario
router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('correo').isEmail().withMessage('El correo electrónico no es válido'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('cedula').notEmpty().withMessage('La cédula es obligatoria'),
    body('direccion').notEmpty().withMessage('La dirección es obligatoria'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let rol = 'comun'; // Rol por defecto
        const adminCorreo = 'yonaikerantony.8@gmail.com';

        // Verificar si el correo electrónico del usuario es el correo del administrador
        if (req.body.correo === adminCorreo) {
            rol = 'admin';
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHasheada = await bcrypt.hash(req.body.contrasena, salt);

        const usuarioData = crearUsuarioData(req, rol);
        usuarioData.contrasena = contrasenaHasheada;

        const result = await usuarioModel.createUsuario(usuarioData);
        res.status(201).send({ mensaje: 'Usuario creado correctamente' });

    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ mensaje: 'El correo electrónico ya está en uso' });
        }
        res.status(500).send({ mensaje: 'Error al crear el usuario', error });
    }
});

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        db.query(`SELECT * FROM usuarios WHERE correo = ?`, [correo], async (err, results) => {
            if (err) {
                console.error('Error al buscar el usuario:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            if (results.length === 0) {
                return res.status(401).json({ mensaje: 'Credenciales inválidas' });
            }

            const usuario = results[0];

            if (usuario.estado !== 'verificado') {
                return res.status(403).json({ mensaje: 'Tu cuenta no ha sido verificada. Por favor, verifica tu correo.' });
            }

            const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

            if (!contrasenaValida) {
                return res.status(401).json({ mensaje: 'Credenciales inválidas' });
            }

            // Guardar el usuario en la sesión
            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
            };

            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                    return res.status(500).json({ mensaje: 'Error al guardar la sesión' });
                }

                res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: req.session.usuario });
            });
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { email, nombre, apellido, telefono, cedula, direccion, password } = req.body;

    try {
        // Verificar si el correo ya existe en la base de datos
        const queryCheckEmail = `SELECT * FROM usuarios WHERE correo = ?`;
        db.query(queryCheckEmail, [email], async (err, results) => {
            if (err) {
                console.error('Error al verificar el correo:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            if (results.length > 0) {
                // Si el correo ya existe, devolver un error
                return res.status(409).json({ mensaje: 'El correo electrónico ya está en uso' });
            }

            // Si el correo no existe, proceder con el registro
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const verificationCode = generateVerificationCode();

            const queryInsertUser = `INSERT INTO usuarios (correo, nombre, apellido, telefono, cedula, direccion, contrasena, rol, codigo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'no_verificado')`;
            db.query(queryInsertUser, [email, nombre, apellido, telefono, cedula, direccion, hashedPassword, 'comun', verificationCode], async (err, result) => {
                if (err) {
                    console.error('Error al registrar el usuario:', err);
                    return res.status(500).json({ mensaje: 'Error al registrar el usuario' });
                }

                try {
                    await sendVerificationEmail(email, verificationCode, nombre);
                    res.status(201).json({ mensaje: 'Usuario registrado correctamente. Verifica tu correo.' });
                } catch (error) {
                    console.error('Error al enviar el correo de verificación:', error);
                    res.status(500).json({ mensaje: 'Usuario registrado, pero no se pudo enviar el correo de verificación.' });
                }
            });
        });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Ruta para verificar el código de verificación
router.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const query = `SELECT * FROM usuarios WHERE correo = ? AND codigo = ? AND estado = 'no_verificado'`;
        db.query(query, [email, verificationCode], (err, results) => {
            if (err) {
                console.error('Error al verificar el código:', err);
                return res.status(500).json({ mensaje: 'Error al verificar el código' });
            }

            if (results.length === 0) {
                return res.status(400).json({ mensaje: 'Código de verificación incorrecto o usuario ya verificado' });
            }

            const updateQuery = `UPDATE usuarios SET codigo = NULL, estado = 'verificado' WHERE correo = ?`;
            db.query(updateQuery, [email], (err, result) => {
                if (err) {
                    console.error('Error al actualizar el estado del usuario:', err);
                    return res.status(500).json({ mensaje: 'Error al actualizar el estado del usuario' });
                }

                res.status(200).json({ mensaje: 'Usuario verificado correctamente' });
            });
        });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Eliminar un usuario (PROTEGIDO SOLO PARA ADMINISTRADORES)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const result = await usuarioModel.deleteUsuario(req.params.id);
        res.send({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).send({ mensaje: 'Error al eliminar el usuario', error });
    }
});

// Ruta para el cierre de sesión
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send({ mensaje: 'Error al cerrar sesión', error: err });
        }
        res.send({ mensaje: 'Cierre de sesión exitoso' });
    });
});

router.get('/sesion', (req, res) => {
    if (req.session && req.session.usuario) {
        return res.status(200).json({ usuario: req.session.usuario });
    }
    res.status(401).json({ mensaje: 'No autenticado' });
});




// Exportar el router
module.exports = router;

