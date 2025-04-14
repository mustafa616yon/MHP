document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener la lista de pagos desde el servidor
    function obtenerPagos() {
        fetch('/pagos') // Reemplaza con la URL de tu API
            .then(response => response.json())
            .then(data => {
                if (data && data.pagos && Array.isArray(data.pagos)) {
                    const pagosPendientes = data.pagos.filter(pago => pago.estado === 'pendiente');
                    // ¡VERIFICA LA CONSISTENCIA DEL ESTADO EN TU BASE DE DATOS!
                    const pagosConfirmados = data.pagos.filter(pago => pago.estado === 'confirmado');
                    console.log('Pagos Pendientes:', pagosPendientes);
                    console.log('Pagos Confirmados (antes de mostrar):', pagosConfirmados);
                    mostrarPagos('pendientes', pagosPendientes);
                    mostrarPagos('confirmados', pagosConfirmados);
                } else {
                    console.error('Error: Los datos recibidos no tienen la estructura esperada.', data);
                }
            })
            .catch(error => {
                console.error('Error al obtener los pagos:', error);
            });
    }

    // Función para mostrar los pagos en la tabla
    function mostrarPagos(estado, pagos) {
        const tbodyId = `#lista-pagos-${estado} tbody`;
        const tbody = document.querySelector(tbodyId);

        if (tbody) {
            tbody.innerHTML = '';

            console.log(`Mostrando pagos con estado: ${estado}`, pagos);

            pagos.forEach(pago => {
                const fechaPago = new Date(pago.fecha);
                const fechaFormateada = fechaPago.toLocaleDateString();
                let productoNombres = '';

                try {
                    const productosArray = JSON.parse(pago.producto);
                    if (Array.isArray(productosArray)) {
                        productoNombres = productosArray.map(item => item.nombre).join(', ');
                        if (productoNombres.length > 150) {
                            productoNombres = productoNombres.substring(0, 150) + '...';
                        }
                    } else if (typeof productosArray === 'object' && productosArray !== null && productosArray.nombre) {
                        productoNombres = productosArray.nombre;
                    } else {
                        productoNombres = pago.producto ? pago.producto.substring(0, 100) + '...' : '';
                    }
                } catch (e) {
                    productoNombres = pago.producto ? pago.producto.substring(0, 100) + '...' : '';
                }

                let accionesHTML = '';
                if (estado === 'pendientes') {
                    accionesHTML = `
                        <button class="confirmar" data-id="${pago.id}">Confirmar</button>
                        <button class="eliminar" data-id="${pago.id}">Eliminar</button>
                    `;
                } else if (estado === 'confirmados') {
                    accionesHTML = `<button class="eliminar" data-id="${pago.id}">Eliminar</button>`;
                    // Si no quieres permitir eliminar confirmados, accionesHTML = '';
                }

                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${pago.id}</td>
                    <td>${pago['numero-referencia']}</td>
                    <td>${pago.nombre}</td>
                    <td>${pago.apellido}</td>
                     <td>${pago.cedula}</td>
                    <td>${pago.monto}</td>
                    <td>${fechaFormateada}</td>
                    <td>${pago.estado}</td>
                    <td class="producto-cell" title="${pago.producto}">${productoNombres}</td>
                    <td>
                        ${accionesHTML}
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.warn(`El elemento ${tbodyId} no se encontró en el DOM.`);
        }
    }

    // Evento para acciones en las tablas (delegación de eventos)
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('eliminar')) {
            const id = event.target.dataset.id;
            eliminarPago(id);
        } else if (event.target.classList.contains('confirmar')) {
            const id = event.target.dataset.id;
            confirmarPago(id); // Llamar a la función para confirmar el pago
        }
    });

    // Función para eliminar un pago
    function eliminarPago(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
            fetch(`/pagos/${id}`, { // Reemplaza con la URL de tu API
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        alert('Pago eliminado correctamente.');
                        obtenerPagos(); // Recargar la lista de pagos
                    } else {
                        alert('Error al eliminar el pago.');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el pago:', error);
                    alert('Error al eliminar el pago.');
                });
        }
    }

    // Función para confirmar un pago
// Función para confirmar un pago
function confirmarPago(id) {
    if (confirm('¿Estás seguro de que quieres confirmar este pago?')) {
        fetch(`/pagos/${id}/estado`, { // Cambia la URL
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'confirmado' })
            })
            .then(response => {
                if (response.ok) {
                    alert('Pago confirmado correctamente.');
                    obtenerPagos(); // Recargar la lista de pagos
                } else {
                    alert('Error al confirmar el pago.');
                }
            })
            .catch(error => {
                console.error('Error al confirmar el pago:', error);
                alert('Error al confirmar el pago.');
            });
    }
}

    // Cargar la lista de pagos al cargar la página
    const listaPagosSection = document.querySelectorAll('#main-content');
    if (listaPagosSection.length > 0) {
        obtenerPagos();
    } else {
        console.warn('No se encontraron las secciones #main-content para las listas de pagos.');
    }
});