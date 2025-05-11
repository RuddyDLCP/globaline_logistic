// Enhanced login handler with email functionality
document.addEventListener("DOMContentLoaded", () => {
  // Referencia global al formulario de login
  const loginForm = document.querySelector(".login-form");
  
  // Inicializar EmailJS solo si está disponible
  if (typeof emailjs !== 'undefined') {
    try {
      emailjs.init("MK4M1cXRW2JZCctlG");
      console.log("EmailJS inicializado correctamente");
    } catch (error) {
      console.error("Error al inicializar EmailJS:", error);
    }
  } else {
    console.warn("EmailJS no está disponible. Asegúrate de incluir la biblioteca en tu HTML.");
  }
  
  // Toggle password visibility
  const togglePassword = document.querySelector(".toggle-password");
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordField = document.getElementById("password");
      if (passwordField) {
        const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
        passwordField.setAttribute("type", type);
        this.querySelector("i").classList.toggle("fa-eye");
        this.querySelector("i").classList.toggle("fa-eye-slash");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessages();

      const submitButton = loginForm.querySelector('button[type="submit"]');
      if (!submitButton) {
        console.error("No se encontró el botón de envío en el formulario");
        return;
      }
      
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

      try {
        // Verificar que los elementos existen antes de acceder a sus valores
        const nombreElement = document.getElementById("nombre");
        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");
        
        if (!nombreElement || !emailElement || !passwordElement) {
          throw new Error("No se encontraron todos los campos del formulario");
        }
        
        const userData = {
          nombre: nombreElement.value.trim(),
          email: emailElement.value.trim(),
          password: passwordElement.value,
        };

        if (!userData.nombre || !userData.email || !userData.password) {
          throw new Error("Todos los campos son obligatorios");
        }

        console.log("Intentando iniciar sesión con:", userData.email);

        // Intentar enviar correo si no es admin (sin bloquear el flujo principal)
        if (userData.email !== "admin@globaline.com") {
          try {
            sendWelcomeEmail(userData);
          } catch (emailError) {
            console.error("Error al enviar correo, continuando con el login:", emailError);
            // No interrumpir el flujo de login si falla el envío de correo
          }
        }

        // Usar URL absoluta o relativa según corresponda
        // Ajusta esta URL según tu configuración
        const apiUrl = window.location.hostname === 'localhost' 
          ? "http://localhost:3000/api/auth/login" 
          : "https://globalinelogisticapi-production.up.railway.app/api/auth/login";
        
        console.log("Enviando solicitud a:", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        });

        console.log("Respuesta recibida:", response.status);

        if (!response.ok) {
          let errorMessage = "Error en la autenticación";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("No se pudo parsear el error como JSON");
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
          console.log("Datos de respuesta:", data);
        } catch (e) {
          console.error("Error al parsear la respuesta como JSON:", e);
          data = { role: userData.email === "admin@globaline.com" ? "ADMIN" : "CLIENT" };
        }

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
  } else {
    console.error("No se encontró el formulario de login");
  }

  // Función para enviar correo de bienvenida/promoción SOLO a clientes
  function sendWelcomeEmail(userData) {
    // Verificar que EmailJS está disponible
    if (typeof emailjs === 'undefined') {
      console.error("EmailJS no está disponible");
      return;
    }
    
    console.log("Preparando envío de correo a:", userData.email);
    
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
    console.log("Procesando login exitoso para:", userData.email);
    
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
      if (userData.email !== "admin@globaline.com" && loginForm) {
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
        console.log("Redirigiendo a:", redirectPage);
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
    if (!loginForm) return;
    
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