document.addEventListener('DOMContentLoaded', function() {
    const pagoMovilLink = document.getElementById('pagomovil');
    const modalPagoMovil = document.getElementById('modal-pagomovil');
    const cerrarModalButton = document.getElementById('cerrar-modal');
    const mostrarFormularioButton = document.getElementById('mostrar-formulario');
    const formularioPago = document.getElementById('formulario-pago');
    const overlay = document.getElementById('overlay');
    const confirmarPagoButton = document.getElementById('confirmar-pago');
    const tarjetasCarrito = document.getElementById('tarjetasCarrito');
    const inputProductoPago = document.getElementById('producto-pago');
    const subtotalElement = document.getElementById('subtotal');
    const ivaElement = document.getElementById('iva');
    const totalElement = document.getElementById('total');
    const deliveryDiv = document.getElementById('delivery');
    const siDeliveryBtn = document.getElementById('si');
    const noDeliveryBtn = document.getElementById('no');

    const IVA_RATE = 0.16;
    const COSTO_DELIVERY = 20;
    let incluirDelivery = false;
    let carritoItems = [];
    const COSTO_DELIVERY_ELEMENT = document.getElementById('costoDelivery');
    
    
    function mostrarCarrito() {
        if (tarjetasCarrito) {
            tarjetasCarrito.innerHTML = '';
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carritoItems = carrito; // Actualizar la variable global carritoItems

            carrito.forEach(producto => {
                const productoCarrito = document.createElement('div');
                productoCarrito.classList.add('producto-card', 'tarjeta');
                productoCarrito.id = `producto-card-${producto.id}`;
                productoCarrito.innerHTML = `
                    <h3 class="nombre"> ${producto.nombre}</h3>
                    <img src="${producto.imagen}" alt="">
                    <span class="tipo"><p>Tipo: </p> ${producto.tipo}</span>
                     <div class="medidas"><p>Medidas: </p>
                     <span class="alto"><p>Alto: </p>${producto.alto}</span>
                     <span class="ancho"><p>Ancho: </p>${producto.ancho}</span>
                     <span class="profundidad"><p>Profundidad: </p>${producto.profundidad}</span>
                     </div>
                    <span class="precio-unitario"><p>Precio: </p>${producto.precio}</span>
                    <span class="color"><p>Color: </p>${producto.color}</span>
                    <div class="botoncarta">
                     <button class="modificar" data-producto-id="${producto.id}">Modificar</button>
                    <button class="borrar" data-producto-id="${producto.id}">Descartar</button>
                    </div>
                `;
                tarjetasCarrito.appendChild(productoCarrito);
            });
            calcularResumen(); // Recalcular el resumen cada vez que se muestra el carrito
        } else {
            console.warn('El elemento #tarjetasCarrito no se encontró en el DOM.');
        }
    }

    function calcularResumen() {
        let subtotalSinIVA = 0;
        carritoItems.forEach(producto => {
            subtotalSinIVA += parseFloat(producto.precio); // Asegúrate de que el precio sea un número
        });

        const iva = subtotalSinIVA * IVA_RATE;
        let totalConIVA = subtotalSinIVA + iva;

        if (incluirDelivery) {
            totalConIVA += COSTO_DELIVERY;
        }

        subtotalElement.textContent = `Subtotal: ${subtotalSinIVA.toFixed(2)} $`;
        ivaElement.textContent = `IVA (${(IVA_RATE * 100).toFixed(0)}%): ${iva.toFixed(2)} $`;
        totalElement.textContent = `Total: ${totalConIVA.toFixed(2)} $`;
        COSTO_DELIVERY_ELEMENT.textContent = `Costo de Delivery: ${incluirDelivery ? COSTO_DELIVERY : 0} $`;
    }

    function manejarConfirmarPago() {
        const referencia = document.getElementById('referencia').value;
        const nombrePago = document.querySelector('#formulario-pago input[placeholder="nombre"]').value;
        const apellido = document.querySelector('#formulario-pago input[placeholder="Apellido"]').value;
        const monto = document.querySelector('#formulario-pago input[placeholder="monto"]').value;
        const cedula = document.querySelector('#formulario-pago input[placeholder="Cedula"]').value;
        const productoPago = inputProductoPago ? inputProductoPago.value : 'Sin especificar';
    
        const pagoData = {
            'numero-referencia': referencia,
            nombre: nombrePago,
            apellido: apellido,
            monto: monto,
            cedula: cedula,
            producto: productoPago,
            estado: 'pendiente'
        };
    
        const carritoParaBackend = carritoItems.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            alto: item.alto,       // Asegúrate de que 'item' tenga esta propiedad
            ancho: item.ancho,     // Asegúrate de que 'item' tenga esta propiedad
            profundidad: item.profundidad, // Asegúrate de que 'item' tenga esta propiedad
            tipo: item.tipo,
            imagen: item.imagen,
            color: item.color
        }));
    
        const detallesPedido = {
            productos: carritoParaBackend,
            incluye_delivery: incluirDelivery,
            costo_delivery: incluirDelivery ? COSTO_DELIVERY : 0,
            subtotal: parseFloat(subtotalElement.textContent.split(': ')[1].replace(' $', '')),
            iva: parseFloat(ivaElement.textContent.split(': ')[1].replace(' $', '')),
            total: parseFloat(totalElement.textContent.split(': ')[1].replace(' $', ''))
        };
    
        console.log('Datos del pedido a enviar:', detallesPedido);
        console.log('Datos del pago a enviar:', pagoData);
    
        fetch('/colores', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detallesPedido)
        })
        .then(response => response.json())
        .then(dataPedidos => {
            console.log('Respuesta al crear pedidos:', dataPedidos);
            if (dataPedidos && (dataPedidos.mensaje || (Array.isArray(dataPedidos) && dataPedidos.length > 0))) {
                alert('Pedido(s) creado(s) correctamente.');
    
                console.log('Datos de pago enviados a /pagos:', { pago: pagoData, detalles_pedido: carritoParaBackend });
                return fetch('/pagos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pago: pagoData, detalles_pedido: carritoParaBackend })
                });
            } else {
                alert('Error al crear el pedido. Por favor, inténtelo de nuevo.');
                return Promise.reject('Error al crear el pedido');
            }
        })
        .then(responsePago => responsePago.json())
        .then(dataPago => {
            console.log('Respuesta del pago:', dataPago);
            let mensajePago = 'Pago registrado. Espere la confirmación de su pedido.';
            if (dataPago && dataPago.pago && dataPago.pago.fecha) {
                const fechaPago = new Date(dataPago.pago.fecha);
                const fechaFormateada = fechaPago.toLocaleDateString();
                mensajePago += ` Fecha de pago: ${fechaFormateada}`;
            }
            alert(mensajePago);
    
            modalPagoMovil.style.display = 'none';
            overlay.style.display = 'none';
            formularioPago.style.display = 'none';
    
            localStorage.removeItem('carrito');
            mostrarCarrito();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar el pedido o el pago.');
        });
    }

    // Event listeners para el modal de Pago Móvil
    if (pagoMovilLink) {
        pagoMovilLink.addEventListener('click', (e) => {
            e.preventDefault();
            modalPagoMovil.style.display = 'block';
            overlay.style.display = 'block'; // Mostrar el overlay
        });
    }

    if (cerrarModalButton) {
        cerrarModalButton.addEventListener('click', () => {
            modalPagoMovil.style.display = 'none';
            overlay.style.display = 'none'; // Ocultar el overlay
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            modalPagoMovil.style.display = 'none';
            overlay.style.display = 'none'; // Ocultar el overlay
        });
    }

    if (mostrarFormularioButton) mostrarFormularioButton.addEventListener('click', () => { formularioPago.style.display = 'block'; });
    if (confirmarPagoButton) confirmarPagoButton.addEventListener('click', manejarConfirmarPago);

    // Event listeners para borrar y modificar productos (sin cambios en esta parte)
    if (tarjetasCarrito) {
        tarjetasCarrito.addEventListener('click', function(event) {
            if (event.target.classList.contains('borrar')) {
                const productoId = event.target.dataset.productoId;
                if (confirm('¿Estás seguro de que quieres borrar este producto del carrito?')) {
                    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                    const nuevoCarrito = carrito.filter(producto => producto.id !== productoId);
                    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
                    mostrarCarrito();
                    alert('Producto borrado del carrito.');
                } else {
                    alert('Operación cancelada.');
                }
            } else if (event.target.classList.contains('modificar')) {
                const productoId = event.target.dataset.productoId;
                abrirPanelEdicion(productoId);
            }
        });
    }

    function abrirPanelEdicion(productoId) {
        const producto = JSON.parse(localStorage.getItem('carrito')).find(p => p.id === productoId);
        const panelEdicion = document.createElement('div');
        panelEdicion.classList.add('panel-edicion');
        panelEdicion.innerHTML = `
            <h3>Editar Producto</h3>
            <label for="editar-alto">Alto (cm):</label>
            <input type="number" id="editar-alto" value="${typeof producto.alto === 'string' ? producto.alto.replace('cm', '').trim() : producto.alto || ''}">
            <label for="editar-ancho">Ancho (cm):</label>
            <input type="number" id="editar-ancho" value="${typeof producto.ancho === 'string' ? producto.ancho.replace('cm', '').trim() : producto.ancho || ''}">
            <label for="editar-profundidad">Profundidad (cm):</label>
            <input type="number" id="editar-profundidad" value="${typeof producto.profundidad === 'string' ? producto.profundidad.replace('cm', '').trim() : producto.profundidad || ''}">
            <label for="editar-color">Color:</label>
            <input type="color" id="editar-color" value="${producto.color || '#000000'}">
            <button id="guardar-cambios" data-producto-id="${productoId}" data-precio-original="${producto.precio}">Guardar</button>
            <button id="cancelar-cambios">Cancelar</button>
        `;
        document.body.appendChild(panelEdicion);

        // Mostrar el overlay
        const overlay = document.getElementById('overlay');
        overlay.classList.add('active');

        const guardarCambiosBtn = panelEdicion.querySelector('#guardar-cambios');
        const cancelarCambiosBtn = panelEdicion.querySelector('#cancelar-cambios');
        const editarAltoInput = panelEdicion.querySelector('#editar-alto');
        const editarAnchoInput = panelEdicion.querySelector('#editar-ancho');
        const editarProfundidadInput = panelEdicion.querySelector('#editar-profundidad');
        const editarColorInput = panelEdicion.querySelector('#editar-color');

        guardarCambiosBtn.addEventListener('click', function () {
            const nuevoAlto = parseFloat(editarAltoInput.value.trim()) || 0;
            const nuevoAncho = parseFloat(editarAnchoInput.value.trim()) || 0;
            const nuevaProfundidad = parseFloat(editarProfundidadInput.value.trim()) || 0;
            const nuevoColor = editarColorInput.value;
            const precioOriginal = parseFloat(this.dataset.precioOriginal);

            const altoOriginal = typeof producto.alto === 'string' ? parseFloat(producto.alto.replace('cm', '').trim()) : producto.alto;
            const anchoOriginal = typeof producto.ancho === 'string' ? parseFloat(producto.ancho.replace('cm', '').trim()) : producto.ancho;
            const profundidadOriginal = typeof producto.profundidad === 'string' ? parseFloat(producto.profundidad.replace('cm', '').trim()) : producto.profundidad;

            const altoDiff = nuevoAlto - (altoOriginal || 0);
            const anchoDiff = nuevoAncho - (anchoOriginal || 0);
            const profundidadDiff = nuevaProfundidad - (profundidadOriginal || 0);

            let ajustePrecio = 0;
            ajustePrecio += altoDiff * 1;
            ajustePrecio += anchoDiff * 1;
            ajustePrecio += profundidadDiff * 1;

            const nuevoPrecio = precioOriginal + ajustePrecio;

            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const nuevoCarrito = carrito.map(p => {
                if (p.id === productoId) {
                    return { ...p, alto: nuevoAlto, ancho: nuevoAncho, profundidad: nuevaProfundidad, color: nuevoColor, precio: nuevoPrecio };
                }
                return p;
            });

            localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
            mostrarCarrito();
            panelEdicion.remove();
            overlay.classList.remove('active'); // Ocultar el overlay
        });

        cancelarCambiosBtn.addEventListener('click', function () {
            panelEdicion.remove();
            overlay.classList.remove('active'); // Ocultar el overlay
        });
    }

    // Manejo de la selección de delivery
    if (siDeliveryBtn && noDeliveryBtn && deliveryDiv) {
        siDeliveryBtn.addEventListener('click', function() {
            incluirDelivery = true;
            calcularResumen();
           
        });

        noDeliveryBtn.addEventListener('click', function() {
            incluirDelivery = false;
            calcularResumen();
        
        });
    }

    mostrarCarrito(); // Llama a mostrarCarrito al cargar la página para inicializar todo

    // Elementos del modal efectivo
    const efectivoLink = document.getElementById('efectivo');
    const modalEfectivo = document.getElementById('modal-efectivo');
    const cerrarModalEfectivoButton = modalEfectivo.querySelector('#cerrar-modal');
    const mostrarFormularioEfectivoButton = modalEfectivo.querySelector('#mostrar-formulario');
    const formularioPagoEfectivo = modalEfectivo.querySelector('#formulario-pago');
    const confirmarPagoEfectivoButton = modalEfectivo.querySelector('#confirmar-pago');

    // Mostrar el modal efectivo
    if (efectivoLink) {
        efectivoLink.addEventListener('click', (e) => {
            e.preventDefault();
            modalEfectivo.style.display = 'block';
            overlay.style.display = 'block';
        });
    }

    // Cerrar el modal efectivo
    if (cerrarModalEfectivoButton) {
        cerrarModalEfectivoButton.addEventListener('click', () => {
            modalEfectivo.style.display = 'none';
            overlay.style.display = 'none';
            formularioPagoEfectivo.style.display = 'none';
        });
    }

    // Mostrar el formulario dentro del modal efectivo
    if (mostrarFormularioEfectivoButton) {
        mostrarFormularioEfectivoButton.addEventListener('click', () => {
            formularioPagoEfectivo.style.display = 'block';
        });
    }

    // Manejar el envío de datos del modal efectivo
    if (confirmarPagoEfectivoButton) {
        confirmarPagoEfectivoButton.addEventListener('click', function () {
            manejarConfirmarPagoEfectivo();
        });
    }

    // Función para manejar el envío de datos del modal efectivo
    function manejarConfirmarPagoEfectivo() {
        const referencia = formularioPagoEfectivo.querySelector('#referencia').value;
        const nombrePago = formularioPagoEfectivo.querySelector('input[placeholder="nombre"]').value;
        const apellido = formularioPagoEfectivo.querySelector('input[placeholder="Apellido"]').value;
        const monto = formularioPagoEfectivo.querySelector('input[placeholder="monto"]').value;
        const cedula = formularioPagoEfectivo.querySelector('input[placeholder="Cedula"]').value;

        const pagoData = {
            'numero-referencia': referencia,
            nombre: nombrePago,
            apellido: apellido,
            monto: monto,
            cedula: cedula,
            metodo: 'Efectivo', // Especificar que el método de pago es efectivo
            estado: 'pendiente'
        };

        console.log('Datos del pago a enviar (efectivo):', pagoData);

        // Enviar los datos al backend
        fetch('/pagos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pagoData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor (efectivo):', data);
                alert('Pago en efectivo registrado correctamente.');

                // Cerrar el modal y limpiar el formulario
                modalEfectivo.style.display = 'none';
                overlay.style.display = 'none';
                formularioPagoEfectivo.style.display = 'none';
                formularioPagoEfectivo.reset();
            })
            .catch(error => {
                console.error('Error al registrar el pago en efectivo:', error);
                alert('Error al registrar el pago. Por favor, inténtelo de nuevo.');
            });
    }
});