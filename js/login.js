document.addEventListener('DOMContentLoaded', function() {
    // Asegúrate de usar HTTPS
    //const API_BASE_URL = "https://globalinelogisticapi-production.up.railway.app";
    
    // ... (código existente del toggle password)

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearMessages();

            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            try {
                const userData = {
                    nombre: document.getElementById('nombre').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value
                };

                if (!userData.nombre || !userData.email || !userData.password) {
                    throw new Error('Todos los campos son obligatorios');
                }

                // Usando HTTPS explícitamente
               const response = await fetch("/api/auth/login", {  // Usa ruta relativa
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
});

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error en la autenticación');
                }

                const data = await response.json();
                handleSuccessfulLogin({
                    email: userData.email,
                    nombre: userData.nombre,
                    role: data.role || 'CLIENT'
                });

            } catch (error) {
                console.error('Error completo:', error);
                showMessage('error', error.message || 'Error al iniciar sesión');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
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