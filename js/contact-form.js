// Configuración de EmailJS para el formulario de contacto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar EmailJS con tu clave pública
  emailjs.init("MK4M1cXRW2JZCctlG")

  const contactForm = document.querySelector(".contact-form")

  if (contactForm) {
    // Importante: Eliminar cualquier otro event listener que pueda estar en el formulario
    const oldSubmit = contactForm.onsubmit
    contactForm.onsubmit = null
    
    contactForm.addEventListener("submit", function(e) {
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
        alert("Por favor complete todos los campos obligatorios.")
        return
      }

      // Obtener los datos del formulario
      const name = contactForm.querySelector("#name").value
      const email = contactForm.querySelector("#email").value
      const phone = contactForm.querySelector("#phone").value
      const company = contactForm.querySelector("#company").value || "No especificada"
      const subject = contactForm.querySelector("#subject").value
      const message = contactForm.querySelector("#message").value

      // Preparar los parámetros para EmailJS
      const templateParams = {
        to_name: name,
        to_email: email,
        from_name: "Globaline Logistics",
        subject: "Gracias por contactar a Globaline Logistics",
        user_name: name,
        user_email: email,
        user_phone: phone,
        user_company: company,
        user_subject: subject,
        user_message: message,
      }

      // Enviar el correo electrónico al usuario
      emailjs
        .send(
          "service_f29j4ao", 
          "template_fkv1cup", 
          templateParams
        )
        .then((response) => {
          console.log("CORREO AL USUARIO ENVIADO!", response.status, response.text)

          // Enviar notificación al administrador (a ti)
          return emailjs.send(
            "service_f29j4ao", 
            "template_tjozvk6", 
            templateParams
          )
        })
        .then((response) => {
          console.log("NOTIFICACIÓN ADMIN ENVIADA!", response.status, response.text)

          // Mostrar mensaje de éxito
          alert("¡Mensaje enviado con éxito! Hemos enviado una confirmación a tu correo electrónico.")
          contactForm.reset()
          submitBtn.innerHTML = originalBtnText
          submitBtn.disabled = false
        })
        .catch((error) => {
          console.log("ERROR:", error)
          alert(
            "Hubo un error al enviar el mensaje. Por favor intenta nuevamente o contáctanos directamente por WhatsApp."
          )
          submitBtn.innerHTML = originalBtnText
          submitBtn.disabled = false
        })
    }, { once: false, capture: true }) // Usar capture para asegurar que este handler se ejecute primero
  }
})