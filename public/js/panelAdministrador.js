let currentMethod = "POST";
let currentId = "";
let currentTable = "comedor";

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

async function savedata(method, id = "") {
    console.log("Tabla actual:", currentTable);
    if (!currentTable) {
        alert("Por favor, selecciona una tabla.");
        return;
    }

    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo').value;
    const alto = document.getElementById('alto').value; // Nuevo campo
    const ancho = document.getElementById('ancho').value; // Nuevo campo
    const profundidad = document.getElementById('profundidad').value; // Nuevo campo
    const precio = document.getElementById('precio').value;
    const img = document.getElementById('img').files[0]; // Obtener el archivo

    if (!nombre) {
        alert("El campo 'Nombre' es obligatorio.");
        return;
    }
    if (!tipo) {
        alert("El campo 'Tipo' es obligatorio.");
        return;
    }
    if (!alto) {
        alert("El campo 'Alto' es obligatorio.");
        return;
    }
    if (!ancho) {
        alert("El campo 'Ancho' es obligatorio.");
        return;
    }
    if (!profundidad) {
        alert("El campo 'Profundidad' es obligatorio.");
        return;
    }
    if (!precio) {
        alert("El campo 'Precio' es obligatorio.");
        return;
    }
    if (!img && method === "POST") {
        alert("El campo 'Imagen' es obligatorio al crear.");
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('tipo', tipo);
    formData.append('alto', alto);
    formData.append('ancho', ancho);
    formData.append('profundidad', profundidad);
    formData.append('precio', precio);
    if (img) {
        formData.append('img', img);
    } else if (method === "PUT") {
        // Si es una actualización y no se selecciona nueva imagen,
        // podemos enviar el nombre de la imagen existente (si lo tenemos)
        const existingImg = document.getElementById('img-preview').src.split('/').pop();
        formData.append('img', existingImg);
    }


    let url = `/mhp/${currentTable}`;

    if (method === "PUT" && id) {
        url = `/mhp/${currentTable}/${id}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        if (response.ok) {
            if (method === "PUT") {
                alert(`Producto actualizado en la tabla "${currentTable}"`);
            } else {
                alert(`Producto guardado en la tabla "${currentTable}"`);
            }
            getTableData(currentTable); // Actualizar la tabla después de guardar
            // Limpiar el formulario después de guardar
            document.getElementById('producto-form').reset();
            currentMethod = "POST";
            currentId = "";
            document.getElementById('boton').textContent = "Guardar";
            const imgPreview = document.getElementById('img-preview');
            if (imgPreview) {
                imgPreview.src = '/img/wood.jpg'; // Restablecer la imagen de vista previa
            }
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.mensaje);
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error de red. Inténtalo de nuevo.");
    }
}

async function editdata(method, id) {
    console.log("Tabla actual:", currentTable);
    console.log("Editando producto con ID: " + id);

    try {
        const response = await fetch(`/mhp/${currentTable}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Datos de la API para editar:", data);

        // Asegúrate de que la respuesta de la API tenga la estructura correcta
        // Debería ser un objeto con la propiedad 'producto' que contenga los datos.
        const producto = data.producto;

        if (producto) {
            document.getElementById('nombre').value = producto.nombre || '';
            document.getElementById('tipo').value = producto.tipo || '';
            document.getElementById('alto').value = producto.alto || '';
            document.getElementById('ancho').value = producto.ancho || '';
            document.getElementById('profundidad').value = producto.profundidad || '';
            document.getElementById('precio').value = producto.precio || '';
           

            // Mostrar la imagen existente en la vista previa
            const imgPreview = document.getElementById('img-preview');
            if (imgPreview && producto.img) {
                imgPreview.src = `${producto.img}`;
            }

            currentMethod = "PUT";
            currentId = id;
            document.getElementById('boton').textContent = "Actualizar";
        } else {
            console.error("Producto no encontrado en la respuesta de la API.");
        }
    } catch (error) {
        console.error("Error al cargar producto para editar:", error);
    }
}

async function deleteitem(id) {
    console.log("Tabla actual:", currentTable);
    try {
        const response = await fetch(`/mhp/${currentTable}/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            alert("Producto borrado");
            getTableData(currentTable); // Actualizar la tabla después de borrar
        } else {
            throw new Error(`Error al borrar el producto: ${response.status}`);
        }
    } catch (error) {
        console.error("Error al borrar el producto:", error);
        alert("Error al borrar el producto. Inténtalo de nuevo.");
    }
}

function changeTable(table) {
    currentTable = table;
    alertaMostrada = false; // Restablecer la variable al cambiar de tabla
    getTableData(table);
    // Restablecer el formulario al cambiar de tabla
    document.getElementById('producto-form').reset();
    currentMethod = "POST";
    currentId = "";
    document.getElementById('boton').textContent = "Guardar";
    const imgPreview = document.getElementById('img-preview');
    if (imgPreview) {
        imgPreview.src = '/img/wood.jpg'; // Restablecer la imagen de vista previa
    }
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
}
);



const btn = document.getElementById('boton');
btn.addEventListener('click', (e) => {
    e.preventDefault();
    savedata(currentMethod, currentId);
});




function renderTableData(productos, table) {
    const nombreTabla = document.getElementById('nombreTabla');
    const temporal1Element = document.getElementById('temporal1');
    nombreTabla.innerHTML = '';
    temporal1Element.innerHTML = '';

    let temporal1Content = `<h2>${table.toUpperCase()}</h2>`;
    let temporal1Content2 = '';

    productos.forEach(producto => {
        const imagePath = `${producto.img}`;
        temporal1Content2 += `
          <div class="producto-card tarjeta" id="producto-card-${producto.id}">
        <h3 class="nombre"> ${producto.nombre}</h3>
        <img src="/img/${imagePath}" alt="">
        <span class="tipo"><p>Tipo: </p> ${producto.tipo}</span>
        <span class="medidas"><p>Medidas: </p><p>Alto: </p>${producto.alto}cm x <p>Ancho: </p>${producto.ancho}cm x <p>Profundidad: </p>${producto.profundidad}cm</span>
        <span class="precio" data-precio="${producto.precio}"><p>Precio: </p>${producto.precio}$</span>
                 <div id="botoncarta">
                    <button id="${producto.id}" onclick="editdata('PUT', ${producto.id})">editar</button>
                    <button id="${producto.id}" onclick="deleteitem(${producto.id})">borrar</button>
                </div>
            </div>
        `;
    });

    if (temporal1Element) {
        nombreTabla.innerHTML = temporal1Content;
        temporal1Element.innerHTML = temporal1Content2;

        // Paginación
        paginarTarjetas();
    } else {
        console.error("Elemento con ID 'temporal1' no encontrado.");
    }
    agregarAnimacionTarjetas();
}



// Paginación y flechas
function paginarTarjetas() {
    const tarjetasContainer = document.getElementById("temporal1");
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


//paginacion y flechas

document.addEventListener('DOMContentLoaded', function() {
    getTableData(currentTable);
    agregarAnimacionTarjetas();
});

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