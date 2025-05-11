document.addEventListener("DOMContentLoaded", () => {
  // Obtener el botón de cambio de tema
  const themeToggle = document.getElementById("themeToggle")

  // Verificar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem("theme")

  // Aplicar el tema guardado o el tema por defecto (claro)
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
  } else {
    document.body.classList.remove("dark-theme")
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
  }

  // Agregar evento de clic al botón de cambio de tema
  themeToggle.addEventListener("click", () => {
    // Alternar la clase dark-theme en el body
    const isDark = document.body.classList.toggle("dark-theme")

    // Actualizar el icono del botón
    if (isDark) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      localStorage.setItem("theme", "dark")
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      localStorage.setItem("theme", "light")
    }
  })
})
