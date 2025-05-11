// Enhanced successful login handler
function handleSuccessfulLogin(userData) {
  // Clear previous auth data first
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
  localStorage.removeItem("userRole")
  localStorage.removeItem("authToken")

  // Add a small delay before setting new values
  setTimeout(() => {
    // Save user data and role
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
      sendLoginNotification(userData.nombre, userData.email)
    }

    // Show success message
    showMessage("success", "¡Acceso concedido! Redirigiendo...")

    // Reset redirect attempt flag
    sessionStorage.removeItem("redirectAttempted")

    // Redirect based on role - don't wait for email sending to complete
    setTimeout(() => {
      const redirectPage = isAdmin ? "../html/Dashboard_admin.html" : "../html/dashboard_client.html"
      window.location.href = redirectPage
    }, 1500)
  }, 100)
}

// Update the sendLoginNotification function to not block the main flow
function sendLoginNotification(name, email) {
  // Initialize EmailJS if not already initialized
  if (typeof emailjs === "undefined") {
    console.error("EmailJS no está disponible")
    return
  }

  if (!emailjs.init) {
    emailjs.init("MK4M1cXRW2JZCctlG")
  }

  // Prepare the parameters for EmailJS
  const templateParams = {
    to_name: name,
    to_email: email,
    from_name: "Globaline Logistics",
    subject: "Inicio de sesión exitoso en Globaline Logistics",
    user_name: name,
    user_email: email,
    user_phone: "No disponible",
    user_company: "No disponible",
    user_subject: "Inicio de sesión",
    user_message: "Has iniciado sesión exitosamente en Globaline Logistics.",
  }

  // Send the email to the user (don't block the main flow)
  emailjs
    .send("service_f29j4ao", "template_fkv1cup", templateParams)
    .then((response) => {
      console.log("CORREO DE LOGIN ENVIADO!", response.status, response.text)

      // Send notification to the administrator
      return emailjs.send("service_f29j4ao", "template_tjozvk6", templateParams)
    })
    .then((response) => {
      console.log("NOTIFICACIÓN ADMIN DE LOGIN ENVIADA!", response.status, response.text)
      // Don't show toast here as user might already be redirected
    })
    .catch((error) => {
      console.log("ERROR AL ENVIAR CORREO DE LOGIN:", error)
    })
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize EmailJS
  emailjs.init("MK4M1cXRW2JZCctlG")

  // Create toast container if it doesn't exist
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
      clearMessages()

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
        showMessage("error", error.message || "Error al iniciar sesión")
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

  // Function to show messages to the user
  function showMessage(type, text) {
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

  // Function to show toast messages
  function showToast(type, title, message) {
    const toastContainer = document.querySelector(".toast-container")

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
