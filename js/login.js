// Enhanced login handler with email functionality
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar EmailJS
  emailjs.init("MK4M1cXRW2JZCctlG");
  
  // Toggle password visibility
  const togglePassword = document.querySelector(".toggle-password");
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordField = document.getElementById("password");
      const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);
      this.querySelector("i").classList.toggle("fa-eye");
      this.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessages();

      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

      try {
        const userData = {
          nombre: document.getElementById("nombre").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        };

        if (!userData.nombre || !userData.email || !userData.password) {
          throw new Error("Todos los campos son obligatorios");
        }

        // Verificar si es un cliente (no administrador) antes de enviar el correo
        if (userData.email !== "admin@globaline.com") {
          // Solo enviar correo si NO es el administrador
          sendWelcomeEmail(userData);
        }

        // Using relative path for API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en la autenticación");
        }

        const data = await response.json();

        // Clear any previous redirect attempts
        sessionStorage.removeItem("redirectAttempted");

        // Enhanced login success handler
        handleSuccessfulLogin({
          email: userData.email,
          nombre: userData.nombre,
          role: data.role || "CLIENT",
          token: data.token,
        });
      } catch (error) {
        console.error("Error completo:", error);
        showMessage("error", error.message || "Error al iniciar sesión");
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  // Función para enviar correo de bienvenida/promoción SOLO a clientes
  function sendWelcomeEmail(userData) {
    const templateParams = {
      to_name: userData.nombre,
      to_email: userData.email,
      from_name: "Globaline Logistics",
      subject: "Bienvenido a Globaline Logistics - Ofertas Especiales",
      user_name: userData.nombre,
      current_date: new Date().toLocaleDateString()
    };

    // Enviar correo al usuario
    emailjs.send("service_f29j4ao", "template_fkv1cup", templateParams)
      .then((response) => {
        console.log("CORREO DE BIENVENIDA ENVIADO!", response.status, response.text);
      })
      .catch((error) => {
        console.error("Error al enviar correo de bienvenida:", error);
        // No bloquear el proceso de login si falla el envío de correo
      });
  }

  // Enhanced successful login handler
  function handleSuccessfulLogin(userData) {
    // Clear previous auth data first
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");

    // Add a small delay before setting new values
    setTimeout(() => {
      // Save user data and role
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userName", userData.nombre);
      localStorage.setItem("userRole", userData.role || "CLIENT");

      // Save token if it exists
      if (userData.token) {
        localStorage.setItem("authToken", userData.token);
        console.log("Token guardado:", userData.token);
      } else {
        console.warn("No se recibió token del servidor");
      }

      // Show success message
      showMessage("success", "¡Acceso concedido! Redirigiendo...");
      
      // Mostrar mensaje adicional sobre el correo promocional si es cliente
      if (userData.email !== "admin@globaline.com") {
        const formHeader = loginForm.querySelector(".login-header") || loginForm;
        const emailMsg = document.createElement("div");
        emailMsg.className = "info-message";
        emailMsg.textContent = "Te hemos enviado un correo con ofertas especiales. ¡Revisa tu bandeja de entrada!";
        formHeader.after(emailMsg);
      }

      // Reset redirect attempt flag
      sessionStorage.removeItem("redirectAttempted");

      // Redirect based on role
      setTimeout(() => {
        const redirectPage =
          userData.role === "ADMIN" || userData.email === "admin@globaline.com"
            ? "../html/Dashboard_admin.html"
            : "../html/dashboard_client.html";
        window.location.href = redirectPage;
      }, 1500);
    }, 100);
  }

  // Function to clear previous messages
  function clearMessages() {
    const messages = document.querySelectorAll(".error-message, .success-message, .info-message");
    messages.forEach((msg) => msg.remove());
  }

  // Function to show messages to the user
  function showMessage(type, text) {
    const messageElement = document.createElement("div");
    messageElement.className = `${type}-message`;
    messageElement.textContent = text;

    const formHeader = loginForm.querySelector(".login-header") || loginForm;
    formHeader.after(messageElement);

    setTimeout(() => {
      messageElement.style.opacity = "0";
      setTimeout(() => messageElement.remove(), 500);
    }, 5000);
  }
});