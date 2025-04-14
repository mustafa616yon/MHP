//db.js
// db.js
const mysql = require('mysql2');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const db = mysql.createConnection({
    host: process.env.DB_HOST || '', // Usa variable de entorno o 'localhost' por defecto
    user: process.env.DB_USER || '',     // Usa variable de entorno o 'root' por defecto
    password: process.env.DB_PASSWORD || '', // Lee la contraseña desde la variable de entorno
    database: process.env.DB_NAME || ''   // Usa variable de entorno o 'mhp' por defecto
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos.');
    }
});

module.exports = { db };

//module.exports={db}




/*


basicamente es lo mismo que la funcion lista en user.ejs



const lista = document.getElementById('lista')
user.forEach(user=>{
    lista.innerHTML +=
    `<li>
    ${user.id} - ${user.username} - ${user.code_VCP}
    </li>
    `
});
*/