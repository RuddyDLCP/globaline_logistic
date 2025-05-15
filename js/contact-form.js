// Configuración de EmailJS para el formulario de contacto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar EmailJS con tu clave pública
  emailjs.init("MK4M1cXRW2JZCctlG")

  // Crear el contenedor de toasts si no existe
  if (!document.querySelector(".toast-container")) {
    const toastContainer = document.createElement("div")
    toastContainer.className = "toast-container"
    document.body.appendChild(toastContainer)
  }

  const contactForm = document.querySelector(".contact-form")

  if (contactForm) {
    // Importante: Eliminar cualquier otro event listener que pueda estar en el formulario
    const oldSubmit = contactForm.onsubmit
    contactForm.onsubmit = null

    contactForm.addEventListener(
      "submit",
      (e) => {
        e.preventDefault()
        e.stopPropagation() // Detener la propagación para evitar que otros handlers se activen

        // Mostrar indicador de carga
        const submitBtn = contactForm.querySelector(".btn-submit")
        const originalBtnText = submitBtn.innerHTML
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'
        submitBtn.disabled = true

        // Validación simple
        const requiredFields = contactForm.querySelectorAll("[required]")
        let isValid = true

        requiredFields.forEach((field) => {
          if (!field.value.trim()) {
            field.style.borderColor = "red"
            isValid = false
          } else {
            field.style.borderColor = "#ddd"
          }
        })

        if (!isValid) {
          submitBtn.innerHTML = originalBtnText
          submitBtn.disabled = false
          showToast("error", "Error de validación", "Por favor complete todos los campos obligatorios.")
          return
        }

        // Obtener los datos del formulario
        const name = contactForm.querySelector("#name").value
        const email = contactForm.querySelector("#email").value
        const phone = contactForm.querySelector("#phone").value
        const company = contactForm.querySelector("#company").value || "No especificada"
        const subject = contactForm.querySelector("#subject").value
        const message = contactForm.querySelector("#message").value

        // Preparar los parámetros para EmailJS - Correo al cliente
        const clientParams = {
          to_name: name,
          to_email: email, // Correo del cliente
          from_name: "Globaline Logistics",
          subject: "Gracias por contactar a Globaline Logistics",
          user_name: name,
          user_email: email,
          user_phone: phone,
          user_company: company,
          user_subject: subject,
          user_message: message,
        }

        // Preparar los parámetros para EmailJS - Notificación al administrador
        const adminParams = {
          to_name: "Administrador",
          to_email: "rubel.021@hotmail.com", // Tu correo fijo para notificaciones
          from_name: "Sistema Globaline",
          subject: "Nuevo mensaje de contacto",
          user_name: name,
          user_email: email,
          user_phone: phone,
          user_company: company,
          user_subject: subject,
          user_message: message,
        }

        // Enviar el correo electrónico al usuario
        emailjs
          .send("service_f29j4ao", "template_fkv1cup", clientParams)
          .then((response) => {
            console.log("CORREO AL CLIENTE ENVIADO!", response.status, response.text)

            // Enviar notificación al administrador (a ti)
            return emailjs.send("service_f29j4ao", "template_tjozvk6", adminParams)
          })
          .then((response) => {
            console.log("NOTIFICACIÓN ADMIN ENVIADA!", response.status, response.text)

            // Mostrar mensaje de éxito
            showToast(
              "success",
              "¡Mensaje enviado con éxito!",
              "Hemos enviado una confirmación a tu correo electrónico.",
            )
            contactForm.reset()
            submitBtn.innerHTML = originalBtnText
            submitBtn.disabled = false
          })
          .catch((error) => {
            console.log("ERROR:", error)
            showToast(
              "error",
              "Error al enviar",
              "Hubo un error al enviar el mensaje. Por favor intenta nuevamente o contáctanos directamente por WhatsApp.",
            )
            submitBtn.innerHTML = originalBtnText
            submitBtn.disabled = false
          })
      },
      { once: false, capture: true },
    ) // Usar capture para asegurar que este handler se ejecute primero
  }
})

// Función para mostrar mensajes toast
function showToast(type, title, message) {
  const toastContainer = document.querySelector(".toast-container")

  // Crear el elemento toast
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`

  // Determinar el icono según el tipo
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

  // Estructura del toast
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

  // Añadir el toast al contenedor
  toastContainer.appendChild(toast)

  // Configurar el botón de cerrar
  const closeBtn = toast.querySelector(".toast-close")
  closeBtn.addEventListener("click", () => {
    toast.style.opacity = "0"
    toast.style.transform = "translateY(-10px)"

    setTimeout(() => {
      toast.remove()
    }, 300)
  })

  // Auto-cerrar después de 5 segundos
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
