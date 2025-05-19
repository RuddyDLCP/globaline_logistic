// Configuración de EmailJS y funcionalidad de login
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar EmailJS con tu clave pública
  emailjs.init("MK4M1cXRW2JZCctlG")

  // Crear el contenedor de toasts si no existe
  if (!document.querySelector(".toast-container")) {
    const toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }

  // Toggle password visibility
  const togglePassword = document.querySelector(".toggle-password")
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordField = document.getElementById("password")
      const type = passwordField.getAttribute("type") === "password" ? "text" : "password"
      passwordField.setAttribute("type", type)
      this.querySelector("i").classList.toggle("fa-eye")
      this.querySelector("i").classList.toggle("fa-eye-slash")
    })
  }

  const loginForm = document.querySelector(".login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      try {
        clearMessages()
      } catch (error) {
        console.error("Error al limpiar mensajes:", error)
      }

      const submitButton = loginForm.querySelector('button[type="submit"]')
      const originalButtonText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...'

      try {
        const userData = {
          nombre: document.getElementById("nombre").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        }

        if (!userData.nombre || !userData.email || !userData.password) {
          throw new Error("Todos los campos son obligatorios")
        }

        // Using relative path for API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Error en la autenticación")
        }

        const data = await response.json()

        // Clear any previous redirect attempts
        sessionStorage.removeItem("redirectAttempted")

        // Enhanced login success handler
        handleSuccessfulLogin({
          email: userData.email,
          nombre: userData.nombre,
          role: data.role || "CLIENT",
          token: data.token,
        })
      } catch (error) {
        console.error("Error completo:", error)

        try {
          showMessage("error", error.message || "Error al iniciar sesión")
        } catch (msgError) {
          console.error("Error al mostrar mensaje de error:", msgError)
        }

        submitButton.disabled = false
        submitButton.innerHTML = originalButtonText
      }
    })
  }

  // Function to clear previous messages
  function clearMessages() {
    const messages = document.querySelectorAll(".error-message, .success-message")
    messages.forEach((msg) => msg.remove())
  }

  // Function to show messages
  function showMessage(type, text) {
    const loginForm = document.querySelector(".login-form")
    if (!loginForm) return

    const messageElement = document.createElement("div")
    messageElement.className = `${type}-message`
    messageElement.textContent = text

    const formHeader = loginForm.querySelector(".login-header") || loginForm
    formHeader.after(messageElement)

    setTimeout(() => {
      messageElement.style.opacity = "0"
      setTimeout(() => messageElement.remove(), 500)
    }, 5000)
  }

  // Enhanced successful login handler
  function handleSuccessfulLogin(userData) {
    try {
      // Clear previous auth data first
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("userRole")
      localStorage.removeItem("authToken")

      // Save user data and role immediately
      localStorage.setItem("userEmail", userData.email)
      localStorage.setItem("userName", userData.nombre)
      localStorage.setItem("userRole", userData.role || "CLIENT")

      // Save token if it exists
      if (userData.token) {
        localStorage.setItem("authToken", userData.token)
        console.log("Token guardado:", userData.token)
      } else {
        console.warn("No se recibió token del servidor")
      }

      // Only send email notification if user is a CLIENT (not an ADMIN)
      const isAdmin = userData.role === "ADMIN" || userData.email === "admin@globaline.com"
      if (!isAdmin) {
        // Start email notification process in background (don't wait for it)
        try {
          sendLoginNotification(userData.nombre, userData.email)
        } catch (emailError) {
          console.error("Error al enviar correo:", emailError)
          // Continue with login process even if email fails
        }
      }

      // Show success message
      try {
        showMessage("success", "¡Acceso concedido! Redirigiendo...")
      } catch (msgError) {
        console.error("Error al mostrar mensaje:", msgError)
        // Continue with login process even if showing message fails
      }

      // Reset redirect attempt flag
      sessionStorage.removeItem("redirectAttempted")

      // IMPORTANT: Ensure redirection happens regardless of any errors
      const redirectPage = isAdmin ? "../html/Dashboard_admin.html" : "../html/dashboard_client.html"
      console.log("Redirigiendo a:", redirectPage)

      // Use both setTimeout and direct navigation to ensure it happens
      setTimeout(() => {
        window.location.href = redirectPage
      }, 1500)
    } catch (error) {
      console.error("Error en handleSuccessfulLogin:", error)

      // Fallback redirection in case of any errors
      const fallbackRedirect =
        userData.role === "ADMIN" || userData.email === "admin@globaline.com"
          ? "../html/Dashboard_admin.html"
          : "../html/dashboard_client.html"

      console.log("Redireccionamiento de emergencia a:", fallbackRedirect)
      window.location.href = fallbackRedirect
    }
  }

  // Update the sendLoginNotification function to not block the main flow
  function sendLoginNotification(name, email) {
    // Check if EmailJS is available
    if (typeof emailjs === "undefined") {
      console.error("EmailJS is not available. Ensure it is properly loaded.")
      return
    }

    try {
      if (!emailjs.init) {
        emailjs.init("MK4M1cXRW2JZCctlG")
      }

      // Preparar los parámetros para EmailJS - Correo al cliente
      const clientParams = {
        to_name: name,
        to_email: email, // Correo del cliente que inició sesión
        from_name: "Globaline Logistics",
        subject: "Inicio de sesión exitoso en Globaline Logistics",
        user_name: name,
        user_email: email,
        user_phone: "No disponible",
        user_company: "No disponible",
        user_subject: "Inicio de sesión",
        user_message: "Has iniciado sesión exitosamente en Globaline Logistics.",
      }

      // Preparar los parámetros para EmailJS - Notificación al administrador
      const adminParams = {
        to_name: "Administrador",
        to_email: "rubel.021@hotmail.com", // Tu correo fijo para notificaciones
        from_name: "Sistema Globaline",
        subject: "Nuevo inicio de sesión",
        user_name: name,
        user_email: email,
        user_phone: "No disponible",
        user_company: "No disponible",
        user_subject: "Inicio de sesión",
        user_message: `El usuario ${name} (${email}) ha iniciado sesión en el sistema.`,
      }

      // Enviar el correo electrónico al usuario
      emailjs
        .send("service_f29j4ao", "template_fkv1cup", clientParams)
        .then((response) => {
          console.log("CORREO DE LOGIN ENVIADO!", response.status, response.text)

          // Enviar notificación al administrador
          return emailjs.send("service_f29j4ao", "template_tjozvk6", adminParams)
        })
        .then((response) => {
          console.log("NOTIFICACIÓN ADMIN DE LOGIN ENVIADA!", response.status, response.text)
          // Don't show toast here as user might already be redirected
        })
        .catch((error) => {
          console.log("ERROR AL ENVIAR CORREO DE LOGIN:", error)
        })
    } catch (error) {
      console.error("Error en sendLoginNotification:", error)
      // Don't throw the error, just log it
    }
  }

  // Global function to show toast messages
  function showToast(type, title, message) {
    const toastContainer = document.querySelector(".toast-container")
    if (!toastContainer) return

    // Create the toast element
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`

    // Determine the icon based on type
    let icon = ""
    switch (type) {
      case "success":
        icon = "fa-check-circle"
        break
      case "error":
        icon = "fa-exclamation-circle"
        break
      case "info":
        icon = "fa-info-circle"
        break
      default:
        icon = "fa-bell"
    }

    // Toast structure
    toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Cerrar">
      <i class="fas fa-times"></i>
    </button>
  `

    // Add the toast to the container
    toastContainer.appendChild(toast)

    // Set up the close button
    const closeBtn = toast.querySelector(".toast-close")
    closeBtn.addEventListener("click", () => {
      toast.style.opacity = "0"
      toast.style.transform = "translateY(-10px)"

      setTimeout(() => {
        toast.remove()
      }, 300)
    })

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0"
        toast.style.transform = "translateY(-10px)"

        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
        }, 300)
      }
    }, 5000)
  }
})