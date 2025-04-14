document.addEventListener('DOMContentLoaded', function() {
    const pedidosPendientesList = document.getElementById('pedidosPendientesList');
    const pedidosConfirmadosList = document.getElementById('pedidosConfirmadosList');
    const btnVerConfirmados = document.getElementById('btnVerConfirmados');

    function obtenerPedidos() {
        fetch('/colores')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos de /colores (GET):', data);
                mostrarPedidos(data); // Pasar todos los datos para que la función los distribuya
            })
            .catch(error => {
                console.error('Error al obtener los pedidos:', error);
                if (pedidosPendientesList) pedidosPendientesList.innerHTML = '<p>Error al cargar los pedidos.</p>';
                if (pedidosConfirmadosList) pedidosConfirmadosList.innerHTML = '<p>Error al cargar los pedidos.</p>';
            });
    }

    function mostrarPedidos(pedidos) {
        if (!pedidos || !Array.isArray(pedidos)) {
            console.error('Error: No se recibieron datos de pedidos válidos para mostrar.', pedidos);
            if (pedidosPendientesList) pedidosPendientesList.innerHTML = '<p>No se encontraron pedidos.</p>';
            if (pedidosConfirmadosList) pedidosConfirmadosList.innerHTML = '<p>No se encontraron pedidos.</p>';
            return;
        }

        // Limpiar ambas listas al recibir los datos
        if (pedidosPendientesList) pedidosPendientesList.innerHTML = '';
        if (pedidosConfirmadosList) pedidosConfirmadosList.innerHTML = '';

        const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'pendiente');
        const pedidosConfirmados = pedidos.filter(pedido => pedido.estado === 'confirmado');

        // Renderizar los pedidos pendientes automáticamente
        if (pedidosPendientes.length > 0 && pedidosPendientesList) {
            pedidosPendientes.forEach(pedido => {
                const pedidoElement = crearTarjetaPedido(pedido, true); // Mostrar botón confirmar en pendientes
                pedidosPendientesList.appendChild(pedidoElement);
            });
        } else if (pedidosPendientesList) {
            pedidosPendientesList.innerHTML = '<p>No hay pedidos pendientes.</p>';
        }

        // Renderizar los pedidos confirmados (inicialmente ocultos)
        if (pedidosConfirmados.length > 0 && pedidosConfirmadosList) {
            pedidosConfirmados.forEach(pedido => {
                const pedidoElement = crearTarjetaPedido(pedido, false); // No mostrar botón confirmar en confirmados
                pedidosConfirmadosList.appendChild(pedidoElement);
            });
        } else if (pedidosConfirmadosList) {
            pedidosConfirmadosList.innerHTML = '<p>No hay pedidos confirmados.</p>';
        }

        agregarEventosEliminar();
        agregarEventosConfirmarAdmin();
    }

    function crearTarjetaPedido(pedido, mostrarConfirmar) {
        const pedidoElement = document.createElement('div');
        pedidoElement.classList.add('pedido-item');
        pedidoElement.innerHTML = `
            <div class="producto-card tarjeta" id="producto-card-${pedido.id}">
                <h3 class="nombre">${pedido.nombre}</h3>
                <img src="${pedido.img || 'ruta/a/imagen-por-defecto.png'}" alt="Imagen del producto">
                <span class="tipo"><p>Tipo: </p> ${pedido.tipo}</span>
                <div class="medidas"><p>Medidas: </p>
                    <span class="alto"><p>Alto: </p>${pedido.alto}cm</span>
                    <span class="ancho"><p>Ancho: </p>${pedido.ancho}cm</span>
                    <span class="profundidad"><p>Profundidad: </p>${pedido.profundidad}cm</span>
                </div>
                <span class="precio"><p>Precio: </p>${pedido.precio}</span>
                <span class="color"><p>Color: </p>${pedido.color}</span>
                <span class="estado"><p>Estado: </p><span id="estado-${pedido.id}">${pedido.estado || 'pendiente'}</span></span>
                <div id="botoncarta">
                    <button class="eliminar" data-producto-id="${pedido.id}">Eliminar</button>
                    ${mostrarConfirmar && pedido.estado === 'pendiente' ? `<button class="confirmar-pedido-admin" data-pedido-id="${pedido.id}">Confirmar</button>` : ''}
                </div>
            </div>
        `;
        return pedidoElement;
    }

    function agregarEventosEliminar() {
        const botonesEliminar = document.querySelectorAll('.eliminar');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', eliminarPedido);
        });
    }

    function agregarEventosConfirmarAdmin() {
        const botonesConfirmar = document.querySelectorAll('.confirmar-pedido-admin');
        botonesConfirmar.forEach(boton => {
            boton.addEventListener('click', confirmarPedidoAdmin);
        });
    }

    function eliminarPedido(event) {
        const productoId = event.target.dataset.productoId;

        // Mostrar la confirmación
        if (confirm(`¿Estás seguro de que quieres eliminar el pedido con ID ${productoId}?`)) {
            fetch(`/colores/${productoId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Pedido con ID ${productoId} eliminado.`);
                    alert(`Pedido con ID ${productoId} eliminado.`);
                    obtenerPedidos();
                } else {
                    console.error(`Error al eliminar el pedido con ID ${productoId}.`);
                }
            })
            .catch(error => {
                console.error('Error al eliminar el pedido:', error);
            });
        } else {
            console.log(`Eliminación del pedido con ID ${productoId} cancelada.`);
            // No hacer nada si el usuario cancela
        }
    }

    function confirmarPedidoAdmin(event) {
        const pedidoId = event.target.dataset.pedidoId;
        const estadoSpan = document.getElementById(`estado-${pedidoId}`);
        const pedidoCard = event.target.closest('.producto-card');
        const confirmarButton = event.target;

        if (!pedidoId) {
            console.error('No se encontró el ID del pedido.');
            return;
        }

        // Mostrar la confirmación antes de enviar la petición
        if (confirm(`¿Confirmar el pedido con ID ${pedidoId}?`)) {
            fetch(`/colores/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'confirmado' })
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Pedido con ID ${pedidoId} confirmado.`);
                    alert(`Pedido con ID ${pedidoId} confirmado.`);

                    // Actualizar el estado visualmente
                    if (estadoSpan) {
                        estadoSpan.textContent = 'confirmado';
                    }

                    // Eliminar el botón de confirmar
                    if (confirmarButton && confirmarButton.parentNode) {
                        confirmarButton.remove();
                    }

                    // Mover el pedido a la lista de confirmados
                    if (pedidoCard && pedidosConfirmadosList) {
                        pedidosConfirmadosList.appendChild(pedidoCard);
                    }

                } else {
                    console.error(`Error al confirmar el pedido con ID ${pedidoId}.`);
                    return response.json().then(data => {
                        if (data && data.message) {
                            alert(`Error al confirmar: ${data.message}`);
                        } else {
                            alert('Error al confirmar el pedido.');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error al confirmar el pedido:', error);
                alert('Error al confirmar el pedido.');
            });
        } else {
            console.log(`Confirmación del pedido con ID ${pedidoId} cancelada.`);
            // No hacer nada si el usuario cancela
        }
    }

    function mostrarConfirmados() {
        if (pedidosConfirmadosList) {
            pedidosConfirmadosList.style.display = pedidosConfirmadosList.style.display === 'none' ? 'grid' : 'none';
        }
    }

    if (btnVerConfirmados) {
        btnVerConfirmados.addEventListener('click', mostrarConfirmados);
    }

    // Obtener los pedidos al cargar la página. Los pendientes se mostrarán automáticamente.
    obtenerPedidos();

    // Inicialmente ocultar la sección de confirmados
    if (pedidosConfirmadosList) {
        pedidosConfirmadosList.style.display = 'none';
    }
});