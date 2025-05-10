document.addEventListener('DOMContentLoaded', function() {
    // Nota: Ya no necesitamos API_BASE_URL para las rutas que pasan por el proxy
    
    // Toggle password visibility
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

                // Validación básica
                if (!userData.nombre || !userData.email || !userData.password) {
                    throw new Error('Todos los campos son obligatorios');
                }

                console.log("Datos a enviar:", JSON.stringify(userData));
                
                // Petición usando el proxy de Netlify (/api -> tu backend)
                const response = await fetch("/api/auth/login", {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    credentials: 'include', // Importante para cookies/sesiones
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error en la autenticación');
                }

                const data = await response.json();
                
                if (data && (data.role === 'ADMIN' || data.role === 'CLIENT')) {
                    handleSuccessfulLogin({
                        email: userData.email,
                        nombre: userData.nombre,
                        role: data.role
                    });
                } else {
                    throw new Error('Error en la autenticación');
                }

            } catch (error) {
                console.error('Error completo:', error);
                showMessage('error', error.message || 'Error al iniciar sesión');
                
                // Restaurar el botón
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        });
    }
    
    // Función para manejar un login exitoso
    function handleSuccessfulLogin(userData) {
        // Guardar datos del usuario y rol
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.nombre);
        localStorage.setItem('userRole', userData.role || 'CLIENT');

        // Mostrar mensaje de éxito
        showMessage('success', '¡Acceso concedido! Redirigiendo...');

        // Redirigir según el rol
        setTimeout(() => {
            const redirectPage = (userData.role === 'ADMIN' || userData.email === "admin@globaline.com") ?
                '../html/Dashboard_admin.html' :
                '../html/dashboard_client.html';
            window.location.href = redirectPage;
        }, 1500);
    }

    // Función para limpiar mensajes anteriores
    function clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    // Función para mostrar mensajes al usuario
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