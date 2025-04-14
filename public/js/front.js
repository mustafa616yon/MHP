document.addEventListener('DOMContentLoaded', function() {
    const mostrarSup = document.getElementById('mostrarSup');
    const sup = document.getElementById('sup');
    const body = document.body;
    const welcomeDiv = document.getElementById('welcome');
    const welcomeAdminDiv = document.getElementById('welcomeAdmin');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');

    if (mostrarSup) { // Verifica si mostrarSup existe
        mostrarSup.addEventListener('click', function(event) {
            // Evita que el clic en el botón cierre la lista inmediatamente
            event.stopPropagation();

            if (sup.style.display === 'none' || sup.style.display === '') {
                sup.style.display = 'block';
            } else {
                sup.style.display = 'none';
            }
        });

        mostrarSup.addEventListener('click', function() {
            sup.classList.toggle('mostrar');
            body.classList.toggle('no-scroll');
        });
    } else {
        console.error("Elemento con ID 'mostrarSup' no encontrado.");
    }

    // Cierra la lista al hacer clic fuera de ella
    document.addEventListener('click', function(event) {
        if (sup && sup.style && sup.style.display === 'block' && !sup.contains(event.target) && event.target !== mostrarSup) {
            sup.style.display = 'none';
        }
    });

    const inputTasa = document.getElementById('input-tasa');
    const tasaMostrada = document.getElementById('tasamostrada');
    const guardarBoton = document.getElementById('guardar-valor');

    if (inputTasa && tasaMostrada && guardarBoton) {
        guardarBoton.addEventListener('click', function () {
            const valorTasa = parseFloat(inputTasa.value);

            if (!isNaN(valorTasa) && valorTasa > 0) {
                fetch('/api/tasa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tasa: valorTasa }),
                })
                    .then(response => response.json())
                    .then(data => {
                        tasaMostrada.textContent = `Tasa del día: ${data.tasa} Bs.`;
                        alert('Tasa guardada correctamente.');
                    })
                    .catch(error => {
                        console.error('Error al guardar la tasa:', error);
                        alert('Error al guardar la tasa.');
                    });
            } else {
                alert('Por favor, ingresa un valor válido.');
            }
        });
    }

    // Mostrar la tasa en otras páginas
    const tasaMostradaGeneral = document.getElementById('tasamostrada');
    if (tasaMostradaGeneral) {
        tasaMostradaGeneral.textContent = `Tasa del día: ${tasaGlobal} Bs.`;
    }

    // Solo ejecuta el código si ambos elementos existen
    if (inputTasa && tasaMostrada) {
        // Escuchar cambios en el input
        inputTasa.addEventListener('input', function () {
            const valorTasa = inputTasa.value;

            // Actualizar el contenedor con el valor ingresado
            if (valorTasa) {
                tasaMostrada.textContent = `Tasa del día: ${valorTasa} Bs.`;

            } else {
                tasaMostrada.textContent = ''; // Limpiar si no hay valor
            }
        });
    }
});

// Variable global para almacenar la tasa
let tasaGlobal = 0; // Inicializa la tasa en 0

const wrapper = document.querySelector('.carousel-wrapper');
const slides = document.querySelectorAll('.carousel-slide');
const slideWidth = slides[0].offsetWidth;
let currentIndex = 0;

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    wrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

setInterval(nextSlide, 3000); // Ajusta la velocidad en milisegundos



function actualizarVistaAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const panelAdminLink = document.querySelector('#panelAdmin');
    const adminPagos = document.querySelector('#pagosAdmin');
    const adminPedidos = document.querySelector('#pedidosLink'); // **CORRECCIÓN: Asumo que este es el ID correcto para "Pedidos"**

    if (usuario && usuario.rol === 'admin') {
        if (panelAdminLink) panelAdminLink.style.display = 'block';
        if (adminPagos) adminPagos.style.display = 'block';
        if (adminPedidos) adminPedidos.style.display = 'block';
    } else {
        if (panelAdminLink) panelAdminLink.style.display = 'none';
        if (adminPagos) adminPagos.style.display = 'none';
        if (adminPedidos) adminPedidos.style.display = 'none';
    }

}

// Llamada inicial al cargar la página
actualizarVistaAdmin();

document.addEventListener('DOMContentLoaded', function () {
    const tasaMostrada = document.getElementById('tasamostrada');

    if (tasaMostrada) {
        fetch('/api/tasa')
            .then(response => response.json())
            .then(data => {
                tasaMostrada.textContent = `Tasa del día: ${data.tasa} Bs.`;
            })
            .catch(error => {
                console.error('Error al obtener la tasa:', error);
                tasaMostrada.textContent = 'Error al cargar la tasa.';
            });
    }
});




