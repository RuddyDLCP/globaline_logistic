document.addEventListener('DOMContentLoaded', function() {
    // Constantes para las credenciales de administrador
    const ADMIN_EMAIL = "admin@globaline.com";
    const ADMIN_PASSWORD = "Xr9$Lk!27p#QzWd3@Fb6";
    
    // URL base de la API en Railway (reemplaza esto con tu URL de Railway)
    const API_BASE_URL = "https://tu-proyecto.railway.app"; // Actualiza esta URL con la de tu proyecto en Railway
    
    // Toggle password visibility (sin cambios)
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Limpiar mensajes anteriores
            clearMessages();

            // Mostrar loader
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            try {
                // Obtener valores del formulario
                const userData = {
                    nombre: document.getElementById('nombre').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value
                };

                // Validación básica (opcional, ya que todos deben pasar)
                if (!userData.nombre || !userData.email || !userData.password) {
                    throw new Error('Todos los campos son obligatorios');
                }

                console.log("Datos a enviar:", JSON.stringify(userData));

                // Petición a la API (usando la URL de Railway)
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                console.log("Respuesta recibida:", response);

                // Manejar respuesta vacía o no JSON
                let data;
                try {
                    const text = await response.text();
                    data = text ? JSON.parse(text) : {};
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    // No vamos a detener el flujo aquí, solo mostramos un error en consola
                }

                // No necesitamos verificar response.ok aquí, ya que queremos que todos pasen inicialmente

                // Determinar el rol basado en las credenciales
                let role = 'CLIENT';
                if (userData.email === ADMIN_EMAIL && userData.password === ADMIN_PASSWORD) {
                    role = 'ADMIN';
                }

                // Guardar datos del usuario y rol (esto ya lo estás haciendo)
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userName', userData.nombre);
                localStorage.setItem('userRole', role); // Guardamos el rol determinado

                // Mostrar mensaje de éxito (podrías personalizarlo según el rol)
                showMessage('success', '¡Acceso concedido! Redirigiendo...');

                // Redirigir según el rol
                setTimeout(() => {
                    const redirectPage = role === 'ADMIN' ?
                        '../html/Dashboard_admin.html' :
                        '../html/dashboard_client.html';
                    window.location.href = redirectPage;
                }, 1500);

            } catch (error) {
                console.error('Error completo:', error);
                showMessage('error', error.message);
            } finally {
                // Restaurar el botón
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        });
    }

    // Función para limpiar mensajes anteriores (sin cambios)
    function clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    // Función para mostrar mensajes al usuario (sin cambios)
    function showMessage(type, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `${type}-message`;
        messageElement.textContent = text;

        const formHeader = loginForm.querySelector('.login-header') || loginForm;
        formHeader.after(messageElement);

        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => messageElement.remove(), 500);
        }, 5000);
    }
});