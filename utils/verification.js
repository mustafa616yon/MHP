require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Función para generar un código de verificación
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos numéricos
};

// Función para enviar el código de verificación por correo
const sendVerificationEmail = async (email, verificationCode, nombre) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de verificación - Mi Hogar Primero',
        text: `Hola ${nombre},\n\nTu código de verificación es: ${verificationCode}\n\nEste código expirará en 15 minutos.\n\nGracias por registrarte en Mi Hogar Primero.`,
    };

    transporter.verify((error) => {
        if (error) console.log("Error en transporter:", error);
        else console.log("Transporter listo para enviar emails");
    });

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${email} con código ${verificationCode}`);
    } catch (error) {
        console.error(`Error al enviar el correo a ${email}:`, error.message);
        throw new Error('No se pudo enviar el correo de verificación. Verifica la dirección de correo.');
    }
};

function isAuthenticated(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    } else {
        console.log('Sesión no encontrada o inválida');
        return res.status(401).json({ mensaje: 'No estás autenticado' });
    }
}

module.exports = { generateVerificationCode, sendVerificationEmail, isAuthenticated };