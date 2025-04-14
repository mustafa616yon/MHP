async function verificarSesion() {
    try {
        const response = await fetch('/usuarios/sesion', {
            method: 'GET',
            credentials: 'include', // Asegura que las cookies se envíen con la solicitud
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Actualiza la interfaz para mostrar el botón de cerrar sesión
            const loginForm = document.getElementById('loginForm');
            const logoutButton = document.getElementById('logoutButton');
            if (loginForm) loginForm.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else if (response.status === 401) {
            // Si no hay sesión activa, muestra el formulario de inicio de sesión
            localStorage.removeItem('usuario');
            const loginForm = document.getElementById('loginForm');
            const logoutButton = document.getElementById('logoutButton');
            if (loginForm) loginForm.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        } else {
            console.error('Error al verificar la sesión:', response.statusText);
            alert('Ocurrió un error al verificar la sesión. Por favor, inténtalo más tarde.');
        }
    } catch (error) {
        console.error('Error al verificar la sesión:', error);
        alert('Error al verificar la sesión. Por favor, verifica tu conexión o inténtalo más tarde.');
        localStorage.removeItem('usuario');
    }
}

document.addEventListener('DOMContentLoaded', verificarSesion);

document.addEventListener('DOMContentLoaded', function () {
    const mostrarLogin = document.getElementById('mostrarLogin');
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');
    const mostrarRegistro = document.getElementById('mostrarRegistro');
    const welcomeDiv = document.getElementById('welcome');
    const welcomeAdminDiv = document.getElementById('welcomeAdmin');
    const logoutButton = document.getElementById('logoutButton');
    const confirmacionForm = document.getElementById('confirmacionForm');
    const confirmarRegistroButton = document.getElementById('confirmarRegistro');

    // Redirigir según el rol del usuario
    const usuario = JSON.parse(localStorage.getItem('usuario'));


    // Función para mostrar el mensaje de bienvenida según el rol
    function mostrarMensajeBienvenida() {
        const usuario = localStorage.getItem('usuario');

        if (usuario) {
            try {
                const usuarioObj = JSON.parse(usuario);
                if (usuarioObj.rol === 'admin') {
                    if (welcomeAdminDiv) {
                        welcomeAdminDiv.style.display = 'block';
                        welcomeAdminDiv.textContent = `Bienvenido Administrador, ${usuarioObj.nombre}`;
                    }
                    if (welcomeDiv) welcomeDiv.style.display = 'none';
                } else {
                    if (welcomeDiv) {
                        welcomeDiv.style.display = 'block';
                        welcomeDiv.textContent = `Bienvenido Usuario, ${usuarioObj.nombre}`;
                    }
                    if (welcomeAdminDiv) welcomeAdminDiv.style.display = 'none';
                }
                if (loginForm) loginForm.style.display = 'none';
                if (logoutButton) logoutButton.style.display = 'block';
            } catch (error) {
                console.error("Error al parsear el usuario:", error);
            }
        } else {
            if (welcomeDiv) welcomeDiv.style.display = 'none';
            if (welcomeAdminDiv) welcomeAdminDiv.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }

    // Llamar a la función para mostrar el mensaje de bienvenida al cargar la página
    mostrarMensajeBienvenida();

    // Mostrar el formulario de registro
    if (mostrarRegistro) {
        mostrarRegistro.addEventListener('click', function (event) {
            event.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registroForm) registroForm.style.display = 'block';
        });
    }

    // Mostrar el formulario de inicio de sesión
    if (mostrarLogin) {
        mostrarLogin.addEventListener('click', function (event) {
            event.preventDefault();
            if (registroForm) registroForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
        });
    }

    // Manejar el envío del formulario de registro
    if (registroForm) {
        registroForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('registroCorreo').value.trim();
            const nombre = document.getElementById('registroNombre').value.trim();
            const apellido = document.getElementById('registroApellido').value.trim();
            const telefono = document.getElementById('registroTelefono').value.trim();
            const cedula = document.getElementById('registroCedula').value.trim();
            const direccion = document.getElementById('registroDireccion').value.trim();
            const password = document.getElementById('registroContrasena').value.trim();
            const confirmarPassword = document.getElementById('registroConfirmarContrasena').value.trim();
            const registroButton = document.getElementById('registro'); // Botón de registro

            // Deshabilitar el botón de registro
            if (registroButton) {
                registroButton.disabled = true;
                registroButton.textContent = 'Registrando...'; // Cambiar el texto del botón
            }

            try {
                const response = await fetch('/usuarios/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, nombre, apellido, telefono, cedula, direccion, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registro exitoso. Por favor, verifica tu correo para ingresar el código.');
                    registroForm.style.display = 'none';
                    if (confirmacionForm) {
                        confirmacionForm.style.display = 'block';
                    }
                } else if (response.status === 409) {
                    alert('El correo electrónico ya está en uso. Por favor, utiliza otro correo.');
                } else {
                    alert(data.mensaje || 'Error al registrar el usuario. Por favor, inténtalo más tarde.');
                }
            } catch (error) {
                console.error('Error al registrar el usuario:', error);
                alert('Error al registrar el usuario. Por favor, verifica tu conexión o inténtalo más tarde.');
            } finally {
                // Habilitar el botón de registro nuevamente
                if (registroButton) {
                    registroButton.disabled = false;
                    registroButton.textContent = 'Registrarse'; // Restaurar el texto del botón
                }
            }
        });
    }

    // Manejar la confirmación del código
    if (confirmarRegistroButton) {
        confirmarRegistroButton.addEventListener('click', async () => {
            const email = document.getElementById('registroCorreo').value;
            const verificationCode = document.getElementById('codigoConfirmacion').value;

            if (!email || !verificationCode) {
                alert('Por favor, ingresa el correo y el código de verificación.');
                return;
            }

            try {
                const response = await fetch('/usuarios/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, verificationCode }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Usuario verificado correctamente. Ahora puedes iniciar sesión.');
                    confirmacionForm.style.display = 'none';
                    if (loginForm) {
                        loginForm.style.display = 'block';
                    } else {
                        console.error('El formulario de inicio de sesión no existe en el DOM.');
                    }
                } else {
                    alert(data.mensaje || 'Código de verificación incorrecto.');
                }
            } catch (error) {
                console.error('Error al verificar el código:', error);
                alert('Error al verificar el código.');
            }
        });
    }

    // Manejar el cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/usuarios/logout', {
                    method: 'POST',
                });

                if (response.ok) {
                    alert('Sesión finalizada');
                    localStorage.removeItem('usuario');
                    window.location.href = '/html/login.html'; // Redirige a la página de login
                } else {
                    alert('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión.');
            }
        });
    }

    // Manejar el envío del formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const correo = document.getElementById('loginCorreo').value;
            const contrasena = document.getElementById('loginContrasena').value;

            try {
                const response = await fetch('/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ correo, contrasena }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Inicio de sesión exitoso');
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    window.location.href = '/'; // Redirige al dashboard o página principal
                } else {
                    alert(data.mensaje || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al iniciar sesión.');
            }
        });
    }

    // Manejar el clic en los botones de alternar contraseña
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetInputId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetInputId);

            if (targetInput) {
                // Alternar entre mostrar y ocultar la contraseña
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    button.textContent = '🙈'; // Cambiar el ícono
                } else {
                    targetInput.type = 'password';
                    button.textContent = '👁️'; // Cambiar el ícono
                }
            }
        });
    });
});

