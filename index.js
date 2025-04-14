require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);


const express = require('express');
const app = express();
const { db } = require('./db/db');
const path = require('path');
const mhpController = require('./controllers/mhpController');
const pagosController = require('./controllers/pagosController');
const usuarioController = require('./controllers/usuarioController');
const coloresController = require('./controllers/coloresController');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const fs = require('fs');
const configPath = path.join(__dirname, 'config.json');

// Verificar si el archivo config.json existe, si no, crearlo con un valor inicial
if (!fs.existsSync(configPath)) {
    const initialConfig = { tasaGlobal: 0 };
    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2), 'utf8');
    console.log('Archivo config.json creado con valor inicial.');
}

// Configuración de middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    store: new SQLiteStore(),
    secret: process.env.SESSION_SECRET, // Obtén el valor desde las variables de entorno
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true, // Asegura que las cookies no sean accesibles desde JavaScript del cliente
        maxAge: 24 * 60 * 60 * 1000, // 1 día
    },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Rutas principales
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// Rutas de administrador
app.get('/admin/panel', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/html/Administrador.html');
});

app.get('/admin/pagos', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/html/pagosAdministrador.html');
});

app.get('/admin/pedidos', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/html/pedidos.html');
});

// Montar controladores
app.use('/mhp', mhpController);
app.use('/pagos', pagosController);
app.use('/usuarios', usuarioController);
app.use('/colores', coloresController);

// Ruta para obtener la tasa
app.get('/api/tasa', (req, res) => {
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de configuración:', err);
            return res.status(500).json({ mensaje: 'Error al obtener la tasa' });
        }
        const config = JSON.parse(data);
        res.json({ tasa: config.tasaGlobal });
    });
});

// Ruta para actualizar la tasa
app.post('/api/tasa', (req, res) => {
    const { tasa } = req.body;
    if (!tasa || isNaN(tasa)) {
        return res.status(400).json({ mensaje: 'Tasa inválida' });
    }

    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de configuración:', err);
            return res.status(500).json({ mensaje: 'Error al actualizar la tasa' });
        }

        const config = JSON.parse(data);
        config.tasaGlobal = parseFloat(tasa);

        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir en el archivo de configuración:', err);
                return res.status(500).json({ mensaje: 'Error al guardar la tasa' });
            }
            res.json({ mensaje: 'Tasa actualizada correctamente', tasa: config.tasaGlobal });
        });
    });
});

app.use((req, res, next) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Conexión a la base de datos
db.connect((error) => {
    if (error) {
        console.log('Error en base de datos');
        return;
    }
    console.log('Conexión exitosa');
    const port = process.env.PORT || 3000; // Asegúrate de usar process.env.PORT
    app.listen(port, () => {
        console.log(`Servidor corriendo en: http://alwaysdata:${port}`);
    });
});

const config = {
    "tasaGlobal": 0
};
