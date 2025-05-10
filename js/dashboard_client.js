document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado
  const userRole = localStorage.getItem("userRole")
  const userName = localStorage.getItem("userName")
  const authToken = localStorage.getItem("authToken")
  const userEmail = localStorage.getItem("userEmail")

  console.log("Dashboard Cliente - Role:", userRole)
  console.log("Dashboard Cliente - Email:", userEmail)
  console.log("Dashboard Cliente - Token exists:", !!authToken)

  // Si no hay token, redirigir al login
  if (!authToken) {
    window.location.href = "html/login.html"
    return
  }

  // Actualizar nombre de usuario en la interfaz
  if (userName) {
    document.getElementById("userName").textContent = userName
  }

  // Detectar si estamos en entorno local
  const isLocalEnvironment = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"

  // URL base de la API - usar la URL completa en entorno local
  const API_BASE_URL = isLocalEnvironment
    ? "https://globalinelogisticapi-production.up.railway.app"
    : "https://globalinelogisticapi-production.up.railway.app"

  console.log("Dashboard Cliente - Entorno local detectado:", isLocalEnvironment)
  console.log("Dashboard Cliente - API Base URL:", API_BASE_URL)

  // Referencias a elementos del DOM
  const userMenuBtn = document.getElementById("userMenuBtn")
  const userDropdown = document.getElementById("userDropdown")
  const themeToggle = document.getElementById("themeToggle")
  const searchInput = document.getElementById("searchInput")
  const sortSelect = document.getElementById("sortSelect")
  const statusFilter = document.getElementById("statusFilter")
  const productsContainer = document.getElementById("productsContainer")
  const loadingContainer = document.getElementById("loadingContainer")
  const emptyState = document.getElementById("emptyState")
  const categoryList = document.getElementById("categoryList")
  const viewButtons = document.querySelectorAll(".view-btn")
  const productModal = document.getElementById("productModal")
  const closeModal = document.getElementById("closeModal")
  const closeModalBtn = document.getElementById("closeModalBtn")

  // Estadísticas
  const totalProductsElement = document.getElementById("totalProducts")
  const totalUnidadesElement = document.getElementById("totalUnidades")
  const totalCategoriasElement = document.getElementById("totalCategorias")

  // Estado de la aplicación
  let productos = []
  let categorias = {}
  let filteredProducts = []
  let currentCategory = "all"
  let currentView = "grid"
  let currentSort = "nombre-asc"
  let currentStatus = "all"
  let searchTerm = ""

  // Inicializar la aplicación
  init()

  // Función para obtener headers con autenticación
  function getAuthHeaders() {
    const token = localStorage.getItem("authToken")
    const headers = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = token
    }

    return headers
  }

  // Función de inicialización
  function init() {
    // Cargar datos iniciales
    cargarProductos()

    // Event listeners para menú de usuario
    if (userMenuBtn) {
      userMenuBtn.addEventListener("click", toggleUserMenu)
    }

    // Event listener para cambio de tema
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme)
      // Verificar tema guardado
      if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme")
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      }
    }

    // Event listeners para búsqueda y filtros
    if (searchInput) {
      searchInput.addEventListener("input", handleSearch)
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", handleSort)
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", handleStatusFilter)
    }

    // Event listeners para cambio de vista
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.view
        changeView(view)
      })
    })

    // Event listeners para modal
    if (closeModal) {
      closeModal.addEventListener("click", () => {
        productModal.classList.remove("show")
      })
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        productModal.classList.remove("show")
      })
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener("click", (e) => {
      if (e.target === productModal) {
        productModal.classList.remove("show")
      }
    })

    // Cerrar menú de usuario al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("show")
      }
    })
  }

  // Funciones para cargar datos
  async function cargarProductos() {
    try {
      showLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/productos`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error("Error al cargar productos")

      productos = await response.json()
      filteredProducts = [...productos]

      // Procesar categorías
      procesarCategorias()

      // Actualizar estadísticas
      actualizarEstadisticas()

      // Renderizar productos
      aplicarFiltrosYOrdenar()

      showLoading(false)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      mostrarToast("error", "Error", "No se pudieron cargar los productos")
      showLoading(false)
      mostrarEstadoVacio(true, "No se pudieron cargar los productos. Intenta de nuevo más tarde.")
    }
  }

  // Función para procesar categorías
  function procesarCategorias() {
    categorias = {}
    categorias["all"] = productos.length

    productos.forEach((producto) => {
      const categoria = producto.categoria || "other"
      if (!categorias[categoria]) {
        categorias[categoria] = 0
      }
      categorias[categoria]++
    })

    renderizarCategorias()
  }

  // Función para renderizar categorías
  function renderizarCategorias() {
    // Mantener "Todos los productos" como primera opción
    const allItem = categoryList.querySelector('[data-category="all"]')
    if (allItem) {
      allItem.querySelector(".category-count").textContent = categorias["all"]
    }

    // Limpiar categorías existentes excepto "all"
    const items = categoryList.querySelectorAll('.category-item:not([data-category="all"])')
    items.forEach((item) => item.remove())

    // Mapeo de categorías a iconos y nombres
    const categoryMappings = {
      electronics: { icon: "fas fa-microchip", name: "Electrónicos" },
      furniture: { icon: "fas fa-couch", name: "Muebles" },
      clothing: { icon: "fas fa-tshirt", name: "Ropa" },
      food: { icon: "fas fa-utensils", name: "Alimentos" },
      other: { icon: "fas fa-box", name: "Otros" },
    }

    // Agregar categorías ordenadas por cantidad (descendente)
    Object.entries(categorias)
      .filter(([key]) => key !== "all")
      .sort((a, b) => b[1] - a[1])
      .forEach(([categoria, count]) => {
        const mapping = categoryMappings[categoria] || { icon: "fas fa-box", name: categoria }

        const li = document.createElement("li")
        li.className = `category-item ${currentCategory === categoria ? "active" : ""}`
        li.dataset.category = categoria
        li.innerHTML = `
                    <i class="${mapping.icon}"></i>
                    <span>${mapping.name}</span>
                    <span class="category-count">${count}</span>
                `

        li.addEventListener("click", () => {
          cambiarCategoria(categoria)
        })

        categoryList.appendChild(li)
      })
  }

  // Función para actualizar estadísticas
  function actualizarEstadisticas() {
    if (totalProductsElement) {
      totalProductsElement.textContent = productos.length
    }

    if (totalUnidadesElement) {
      const totalUnidades = productos.reduce((sum, producto) => sum + (producto.cantidad || 0), 0)
      totalUnidadesElement.textContent = totalUnidades
    }

    if (totalCategoriasElement) {
      const uniqueCategories = new Set(productos.map((p) => p.categoria || "other")).size
      totalCategoriasElement.textContent = uniqueCategories
    }
  }

  // Funciones para filtrar y ordenar
  function aplicarFiltrosYOrdenar() {
    // Aplicar filtro de categoría
    let filtered = [...productos]
    if (currentCategory !== "all") {
      filtered = filtered.filter((producto) => (producto.categoria || "other") === currentCategory)
    }

    // Aplicar filtro de estado
    if (currentStatus !== "all") {
      filtered = filtered.filter((producto) => {
        const isAvailable = producto.cantidad > 0
        return currentStatus === "available" ? isAvailable : !isAvailable
      })
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (producto) =>
          (producto.nombre && producto.nombre.toLowerCase().includes(term)) ||
          (producto.codigo && producto.codigo.toLowerCase().includes(term)) ||
          (producto.cliente && producto.cliente.toLowerCase().includes(term)),
      )
    }

    // Ordenar
    filtered.sort((a, b) => {
      const [field, direction] = currentSort.split("-")
      let valueA, valueB

      switch (field) {
        case "nombre":
          valueA = a.nombre || ""
          valueB = b.nombre || ""
          break
        case "fecha":
          valueA = new Date(a.fechaEntrada || 0).getTime()
          valueB = new Date(b.fechaEntrada || 0).getTime()
          break
        default:
          valueA = a[field] || ""
          valueB = b[field] || ""
      }

      if (typeof valueA === "string") {
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      } else {
        return direction === "asc" ? valueA - valueB : valueB - valueA
      }
    })

    filteredProducts = filtered
    renderizarProductos()
  }

  // Función para renderizar productos
  function renderizarProductos() {
    productsContainer.innerHTML = ""

    if (filteredProducts.length === 0) {
      mostrarEstadoVacio(true)
      return
    }

    mostrarEstadoVacio(false)

    filteredProducts.forEach((producto) => {
      const card = document.createElement("div")
      card.className = "product-card"

      // Determinar el estado del producto
      const isAvailable = producto.cantidad > 0
      const statusClass = isAvailable ? "available" : "unavailable"
      const statusText = isAvailable ? "Disponible" : "No disponible"

      // Formatear fecha
      const fechaEntrada = new Date(producto.fechaEntrada || Date.now())
      const fechaFormateada = fechaEntrada.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

      // Mapeo de categorías a nombres amigables
      const categoryMappings = {
        electronics: "Electrónicos",
        furniture: "Muebles",
        clothing: "Ropa",
        food: "Alimentos",
        other: "Otros",
      }

      const categoryName = categoryMappings[producto.categoria] || producto.categoria || "Sin categoría"

      card.innerHTML = `
                <div class="product-image">
                    <div class="product-image-placeholder">
                        <i class="fas fa-box"></i>
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${categoryName}</div>
                    <h3 class="product-name">${producto.nombre || "Sin nombre"}</h3>
                    <div class="product-info">
                        <div class="product-meta">
                            <i class="fas fa-barcode"></i>
                            <span>${producto.codigo || "Sin código"}</span>
                        </div>
                        <div class="product-meta">
                            <i class="fas fa-cubes"></i>
                            <span>${producto.cantidad || 0} unidades</span>
                        </div>
                        <div class="product-meta">
                            <i class="fas fa-calendar"></i>
                            <span>${fechaFormateada}</span>
                        </div>
                    </div>
                    <div class="product-footer">
                        <div class="product-client">${producto.cliente || "Sin cliente"}</div>
                        <div class="product-status ${statusClass}">${statusText}</div>
                    </div>
                </div>
            `

      // Event listener para abrir modal
      card.addEventListener("click", () => {
        mostrarDetallesProducto(producto)
      })

      productsContainer.appendChild(card)
    })
  }

  // Función para mostrar detalles del producto
  function mostrarDetallesProducto(producto) {
    // Determinar el estado del producto
    const isAvailable = producto.cantidad > 0
    const statusClass = isAvailable ? "available" : "unavailable"
    const statusText = isAvailable ? "Disponible" : "No disponible"

    // Formatear fechas
    const fechaEntrada = new Date(producto.fechaEntrada || Date.now())
    const fechaEntradaFormateada = fechaEntrada.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const fechaSalida = producto.fechaSalida ? new Date(producto.fechaSalida) : null
    const fechaSalidaFormateada = fechaSalida
      ? fechaSalida.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "No registrada"

    // Mapeo de categorías a nombres amigables
    const categoryMappings = {
      electronics: "Electrónicos",
      furniture: "Muebles",
      clothing: "Ropa",
      food: "Alimentos",
      other: "Otros",
    }

    const categoryName = categoryMappings[producto.categoria] || producto.categoria || "Sin categoría"

    // Actualizar contenido del modal
    document.getElementById("modalProductName").textContent = producto.nombre || "Sin nombre"
    document.getElementById("modalProductCode").textContent = producto.codigo || "Sin código"
    document.getElementById("modalProductCategory").textContent = categoryName
    document.getElementById("modalProductClient").textContent = producto.cliente || "Sin cliente"
    document.getElementById("modalProductQuantity").textContent = `${producto.cantidad || 0} unidades`
    document.getElementById("modalProductLocation").textContent = producto.ubicacion || "No especificada"
    document.getElementById("modalProductEntryDate").textContent = fechaEntradaFormateada

    const statusElement = document.getElementById("modalProductStatus")
    statusElement.textContent = statusText
    statusElement.className = `detail-badge ${statusClass}`

    document.getElementById("modalProductDescription").textContent =
      producto.descripcion || "Este producto no tiene una descripción detallada."

    // Mostrar modal
    productModal.classList.add("show")
  }

  // Funciones para manejar eventos
  function toggleUserMenu() {
    userDropdown.classList.toggle("show")
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-theme")

    if (isDark) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      localStorage.setItem("theme", "dark")
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      localStorage.setItem("theme", "light")
    }
  }

  function handleSearch() {
    searchTerm = searchInput.value.trim()
    aplicarFiltrosYOrdenar()
  }

  function handleSort() {
    currentSort = sortSelect.value
    aplicarFiltrosYOrdenar()
  }

  function handleStatusFilter() {
    currentStatus = statusFilter.value
    aplicarFiltrosYOrdenar()
  }

  function cambiarCategoria(categoria) {
    currentCategory = categoria

    // Actualizar UI
    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.category === categoria)
    })

    aplicarFiltrosYOrdenar()
  }

  function changeView(view) {
    currentView = view

    // Actualizar UI
    viewButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view)
    })

    productsContainer.className = `products-container ${view}-view`
  }

  // Funciones de utilidad
  function showLoading(show) {
    if (loadingContainer) {
      loadingContainer.style.display = show ? "flex" : "none"
    }
  }

  function mostrarEstadoVacio(show, message = "No hay productos que coincidan con tu búsqueda o filtros.") {
    if (emptyState) {
      emptyState.style.display = show ? "block" : "none"
      const messageElement = emptyState.querySelector("p")
      if (messageElement) {
        messageElement.textContent = message
      }
    }
  }

  function mostrarToast(type, title, message) {
    const toastContainer = document.getElementById("toastContainer")
    if (!toastContainer) return

    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`

    let icon = "info-circle"
    if (type === "success") icon = "check-circle"
    if (type === "error") icon = "exclamation-circle"
    if (type === "warning") icon = "exclamation-triangle"

    toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `

    toastContainer.appendChild(toast)

    // Eliminar toast después de 5 segundos
    setTimeout(() => {
      toast.style.opacity = "0"
      setTimeout(() => {
        toast.remove()
      }, 300)
    }, 5000)
  }
})
