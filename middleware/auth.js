// middleware/auth.js

function isAuthenticated(req, res, next) {
    console.log('Sesión actual:', req.session); // <-- Agrega este log
    if (!req.session || !req.session.usuario) {
        console.log('Sesión no encontrada o inválida');
        return res.status(401).send({ mensaje: 'No autenticado' });
    }
    next();
}

function isAdmin(req, res, next) {
    console.log('Datos de usuario en sesión:', req.session.usuario); // Log para depuración
    if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
        return next();
    }
    res.status(403).send({ mensaje: 'Acceso denegado. Se requiere rol de administrador.' });
}

// Exportar las funciones
module.exports = { isAuthenticated, isAdmin };

