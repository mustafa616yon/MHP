//catalogo
let currentTable = "peinadora";

async function getTableData(table) {
    try {
        const response = await fetch(`/mhp/${table}`);
        if (!response.ok) {
            throw new Error(`Error al obtener datos de ${table}: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.productos) {
            renderTableData(data.productos, table); // Renderizar solo la tabla actual
        } else {
            console.error(`Respuesta de la API sin datos de productos para ${table}.`);
        }
    } catch (error) {
        console.error("Error al obtener datos de la tabla:", error);
        alert("Error al cargar los datos. Inténtalo de nuevo.");
    }
}

//renderTable limpiando el contenedor
function renderTableData(productos, table) {
    const nombreTabla = document.getElementById('catalogo');
    const catalogoCardsElement = document.getElementById('catalogo-cards'); // Usa el ID correcto
    nombreTabla.innerHTML = '';
    catalogoCardsElement.innerHTML = ''; // Usa el ID correcto

    let catalogoContent = `<h2>${table.toUpperCase()}</h2>`;
    let catalogoContent2 = '';

    productos.forEach(producto => {
        const imagePath = `${producto.img}`;
        catalogoContent2 += `
         <div class="producto-card tarjeta" id="producto-card-${producto.id}">
        <h3 class="nombre"> ${producto.nombre}</h3>
        <img src="/img/${imagePath}" alt="">
        <span class="tipo"><p>Tipo: </p> ${producto.tipo}</span>
        <div class="medidas"><p>Medidas: </p>
        <span class="alto"><p>Alto: </p>${producto.alto}cm</span>
        <span class="ancho"><p>Ancho: </p>${producto.ancho}cm</span>
        <span class="profundidad"><p>Profundidad: </p>${producto.profundidad}cm</span>
        </div>
        <span class="precio" data-precio="${producto.precio}"><p>Precio: </p>${producto.precio}$</span>
        <div id="botoncarta">
            <button class="agregar-carrito" data-producto='${JSON.stringify(producto)}'>Agregar al carrito</button>
        </div>
    </div>
        `;
    });

    if (catalogoCardsElement) { // Usa el ID correcto
        nombreTabla.innerHTML = catalogoContent;
        catalogoCardsElement.innerHTML = catalogoContent2; // Usa el ID correcto
        paginarTarjetas();
    } else {
        console.error("Elemento con ID 'catalogo-cards' no encontrado.");
    }
}


// Paginación y flechas
function paginarTarjetas() {
    const tarjetasContainer = document.getElementById("catalogo-cards");
    const prevButton = document.getElementById("prevB");
    const nextButton = document.getElementById("nextB");

    console.log("paginarTarjetas() llamado");

    const tarjetasPorPagina = 8;
    let paginaActual = 0;
    let todasLasTarjetas = [].slice.call(tarjetasContainer.children);
    let alertaMostrada = false; // Variable de estado para rastrear la alerta

    console.log("Número de tarjetas:", todasLasTarjetas.length);

    function mostrarTarjetas() {
        console.log("mostrarTarjetas() llamado, página actual:", paginaActual);
        const inicio = paginaActual * tarjetasPorPagina;
        const fin = inicio + tarjetasPorPagina;

        todasLasTarjetas.forEach((tarjeta, index) => {
            if (index >= inicio && index < fin) {
                tarjeta.classList.remove("oculto");
            } else {
                tarjeta.classList.add("oculto");
            }
        });

        prevButton.disabled = paginaActual === 0;
        nextButton.disabled = fin >= todasLasTarjetas.length;

        // Verificar si estamos al final del arreglo
        if (fin >= todasLasTarjetas.length && todasLasTarjetas.length > 0) {
            nextButton.disabled = true; // Deshabilitar el botón "Siguiente"
        }
        agregarAnimacionTarjetas();
    }

    prevButton.addEventListener("click", () => {
        // Verificar si estamos al inicio del arreglo antes de retroceder
        if (paginaActual > 0) {
            paginaActual--;
            mostrarTarjetas();
        }
        alertaMostrada = false; // Restablecer el estado de la alerta al retroceder
    });

    nextButton.addEventListener("click", () => {
        // Verificar si estamos al final del arreglo antes de avanzar
        if (paginaActual * tarjetasPorPagina < todasLasTarjetas.length) {
            paginaActual++;
            mostrarTarjetas();
        } else if (!alertaMostrada) {
            alert("No hay más tarjetas que mostrar.");
            alertaMostrada = true; // Establecer el estado de la alerta como mostrada
        }
    });

    mostrarTarjetas();
}


function changeTable(table) {
    currentTable = table;
    alertaMostrada = false; // Restablecer la variable al cambiar de tabla
    getTableData(table);
}

const tabla1 = document.getElementById('comedor');
tabla1.addEventListener('click', () => {
    console.log("Cambiando a comedor");
    changeTable('comedor');
});

const tabla2 = document.getElementById('mesa-tv');
tabla2.addEventListener('click', () => {
    console.log("Cambiando a mesa-tv");
    changeTable('mesa-tv');
});

const tabla3 = document.getElementById('mesa-centro');
tabla3.addEventListener('click', () => {
    console.log("Cambiando a mesa-centro");
    changeTable('mesa-centro');
});

const tabla4 = document.getElementById('mesa-noche');
tabla4.addEventListener('click', () => {
    console.log("Cambiando a mesa-noche");
    changeTable('mesa-noche');
});

const tabla5 = document.getElementById('peinadora');
tabla5.addEventListener('click', () => {
    console.log("Cambiando a peinadora");
    changeTable('peinadora');
});

document.addEventListener('DOMContentLoaded', function() {
    getTableData(currentTable);
});




// Guardar en localStorage
function agregarAlCarrito(productoId) {
    const productoCard = document.getElementById(`producto-card-${productoId}`);

    if (productoCard) {
        const nombre = productoCard.querySelector('.nombre').textContent;
        const tipo = productoCard.querySelector('.tipo').textContent;
        const altoTexto = productoCard.querySelector('.alto').textContent.replace('Alto: ', '').replace('cm', '').trim();
        const anchoTexto = productoCard.querySelector('.ancho').textContent.replace('Ancho: ', '').replace('cm', '').trim();
        const profundidadTexto = productoCard.querySelector('.profundidad').textContent.replace('Profundidad: ', '').replace('cm', '').trim();
        const precio = productoCard.querySelector('.precio').dataset.precio;
        const imagen = productoCard.querySelector('img').src;

        const producto = {
            id: productoId,
            nombre: nombre,
            tipo: tipo,
            alto: altoTexto, // Guardar solo el número (como cadena)
            ancho: anchoTexto, // Guardar solo el número (como cadena)
            profundidad: profundidadTexto, // Guardar solo el número (como cadena)
            precio: parseFloat(precio), // Guardar el precio como número
            imagen: imagen,
            color: '#000000'
        };

        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));

        alert(`${nombre} ha sido agregado al carrito.`);
    } else {
        console.error(`No se encontró la tarjeta del producto con ID: producto-card-${productoId}`);
    }
}


// Agrega un event listener al contenedor de tarjetas
const catalogoCardsElement = document.getElementById('catalogo-cards');
if (catalogoCardsElement) {
    catalogoCardsElement.addEventListener('click', function(event) {
        if (event.target.classList.contains('agregar-carrito')) {
            const productoId = event.target.closest('.producto-card').id.split('-')[2]; // Extrae el ID del producto
            agregarAlCarrito(productoId);
        }
    });
} else {
    console.error("El elemento con ID 'catalogo-cards' no se encontró en el DOM.");
}

function agregarAnimacionTarjetas() {
    const tarjetas = document.querySelectorAll('.producto-card');
    tarjetas.forEach((tarjeta, index) => {
        tarjeta.style.animationDelay = `${index * 0.1}s`; // Retraso dinámico basado en el índice
    });
}

// Llama a esta función después de generar las tarjetas dinámicamente
document.addEventListener('DOMContentLoaded', () => {
    agregarAnimacionTarjetas();
});
