// Este script debe añadirse a tu página index.html existente
// Maneja la redirección del formulario de seguimiento a la página de tracking

document.addEventListener("DOMContentLoaded", () => {
  // Selecciona el formulario de seguimiento usando el selector exacto de tu HTML
  const trackingForm = document.querySelector(".tracking-form")

  if (trackingForm) {
    // Añade el evento de envío al formulario
    trackingForm.addEventListener("submit", function (e) {
      // Previene el envío normal del formulario
      e.preventDefault()

      // Obtiene el input (primer input dentro del formulario)
      const trackingInput = this.querySelector("input[type='text']")

      if (trackingInput) {
        const trackingNumber = trackingInput.value.trim()

        // Valida el número de seguimiento
        if (trackingNumber) {
          // Redirige a la página de seguimiento con el número como parámetro
          // SOLUCIÓN CORRECTA: Usa la ruta absoluta correcta
          window.location.href = `/html/tracking-page.html?tracking=${encodeURIComponent(trackingNumber)}`
        } else {
          // Muestra error si el número de seguimiento está vacío
          alert("Por favor ingrese un número de seguimiento válido.")
        }
      } else {
        console.error("No se encontró el campo de entrada en el formulario de seguimiento")
      }
    })

    console.log("Script de seguimiento inicializado correctamente")
  } else {
    console.error("No se encontró el formulario de seguimiento (.tracking-form)")

    // Alternativa: buscar cualquier formulario en la sección de tracking
    const trackingSection = document.querySelector(".tracking")
    if (trackingSection) {
      const alternativeForm = trackingSection.querySelector("form")
      if (alternativeForm) {
        console.log("Se encontró un formulario alternativo")

        alternativeForm.addEventListener("submit", function (e) {
          e.preventDefault()
          const input = this.querySelector("input")
          if (input && input.value.trim()) {
            // SOLUCIÓN CORRECTA: Usa la ruta absoluta correcta
            window.location.href = `/html/tracking-page.html?tracking=${encodeURIComponent(input.value.trim())}`
          } else {
            alert("Por favor ingrese un número de seguimiento válido.")
          }
        })
      }
    }
  }
})
