// Enhanced admin dashboard authentication check
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem("theme")

  // Aplicar el tema guardado o el tema por defecto (claro)
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    }
  }
  // Verify if the user is authenticated and is an administrator
  const userRole = localStorage.getItem("userRole")
  const userName = localStorage.getItem("userName")
  const authToken = localStorage.getItem("authToken")
  const userEmail = localStorage.getItem("userEmail")

  console.log("Dashboard Check - Role:", userRole)
  console.log("Dashboard Check - Email:", userEmail)
  console.log("Dashboard Check - Token exists:", !!authToken)

  // Enhanced authentication check
  const isAdmin = userRole === "ADMIN" || userEmail === "admin@globaline.com"

  if (!authToken || !isAdmin) {
    console.error("Authentication failed in dashboard")
    // Only redirect if we haven't already tried to redirect in this session
    if (sessionStorage.getItem("redirectAttempted") !== "true") {
      sessionStorage.setItem("redirectAttempted", "true")
      window.location.href = "../html/login.html"
      return
    } else {
      console.warn("Preventing redirect loop - already attempted redirect")
      // Show a login button instead of redirecting again
      showLoginPrompt()
      return
    }
  }

  // Mark that we've successfully loaded the admin dashboard
  sessionStorage.setItem("adminDashboardLoaded", "true")

  // Rest of your dashboard initialization code...
  initializeDashboard()

  // Function to show login prompt instead of redirecting
  function showLoginPrompt() {
    const mainContent = document.querySelector("main") || document.body
    const loginPrompt = document.createElement("div")
    loginPrompt.className = "login-prompt"
    loginPrompt.innerHTML = `
            <div class="login-prompt-container">
                <h2>Sesión expirada</h2>
                <p>Tu sesión ha expirado o no tienes permisos suficientes.</p>
                <button id="goToLoginBtn" class="btn btn-primary">Iniciar sesión</button>
            </div>
        `

    // Add styles
    const style = document.createElement("style")
    style.textContent = `
            .login-prompt {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .login-prompt-container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                text-align: center;
                max-width: 400px;
            }
            .btn-primary {
                background: #4a6cf7;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 1rem;
            }
        `

    document.head.appendChild(style)
    mainContent.appendChild(loginPrompt)

    // Add event listener to login button
    document.getElementById("goToLoginBtn").addEventListener("click", () => {
      // Clear session storage and redirect to login
      sessionStorage.clear()
      localStorage.clear()
      window.location.href = "../html/login.html"
    })
  }

  // Function to initialize dashboard
  function initializeDashboard() {
    // Your existing dashboard initialization code
    console.log("Dashboard initialized successfully")

    // URL base de la API
    const API_BASE_URL = "https://globalinelogisticapi-production.up.railway.app"

    // Referencias a elementos del DOM
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const mobileMenu = document.getElementById("mobileMenu")
    const addProductBtn = document.getElementById("addProductBtn")
    const addProductModal = document.getElementById("addProductModal")
    const closeAddModal = document.getElementById("closeAddModal")
    const cancelAddBtn = document.getElementById("cancelAddBtn")
    const editProductModal = document.getElementById("editProductModal")
    const closeEditModal = document.getElementById("closeEditModal")
    const cancelEditBtn = document.getElementById("cancelEditBtn")
    const deleteProductModal = document.getElementById("deleteProductModal")
    const closeDeleteModal = document.getElementById("closeDeleteModal")
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
    const searchInput = document.getElementById("searchInput")
    const categoryFilter = document.getElementById("categoryFilter")
    const inventoryTableBody = document.getElementById("inventoryTableBody")
    const emptyState = document.getElementById("emptyState")
    const addProductForm = document.getElementById("addProductForm")
    const editProductForm = document.getElementById("editProductForm")

    // Estadísticas
    const totalProductsElement = document.getElementById("totalProducts")
    const totalUnidadesElement = document.getElementById("totalUnidades")
    const totalAlmacenElement = document.getElementById("totalAlmacen")
    const clientesElement = document.getElementById("clientes")

    // Estado de la aplicación
    let productos = []
    const currentSort = { field: null, direction: "asc" }

    // Inicializar la aplicación
    initDashboardComponents()

    // Función para obtener headers con autenticación
    function getAuthHeaders() {
      const token = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = token
        console.log("Enviando token:", token) // Para depuración
      } else {
        console.warn("No se encontró token de autenticación") // Para depuración
      }

      return headers
    }

    // Función de inicialización de componentes del dashboard
    function initDashboardComponents() {
      // Cargar datos iniciales
      cargarEstadisticas()
      cargarProductos()

      // Event listeners para menú móvil
      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", toggleMobileMenu)
      }

      // Event listeners para modales
      if (addProductBtn) {
        addProductBtn.addEventListener("click", () => openModal(addProductModal))
      }

      if (closeAddModal) {
        closeAddModal.addEventListener("click", () => closeModal(addProductModal))
      }

      if (cancelAddBtn) {
        cancelAddBtn.addEventListener("click", () => closeModal(addProductModal))
      }

      if (closeEditModal) {
        closeEditModal.addEventListener("click", () => closeModal(editProductModal))
      }

      if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => closeModal(editProductModal))
      }

      if (closeDeleteModal) {
        closeDeleteModal.addEventListener("click", () => closeModal(deleteProductModal))
      }

      if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => closeModal(deleteProductModal))
      }

      // Event listeners para formularios
      if (addProductForm) {
        addProductForm.addEventListener("submit", handleAddProduct)
      }

      if (editProductForm) {
        editProductForm.addEventListener("submit", handleEditProduct)
      }

      if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", handleDeleteProduct)
      }

      // Event listeners para filtros
      if (searchInput) {
        searchInput.addEventListener("input", handleSearch)
      }

      if (categoryFilter) {
        categoryFilter.addEventListener("change", handleCategoryFilter)
      }

      // Event listeners para ordenamiento de tabla
      document.querySelectorAll("th[data-sort]").forEach((th) => {
        th.addEventListener("click", () => handleSort(th.dataset.sort))
      })
    }

    // Funciones para cargar datos
    async function cargarEstadisticas() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/productos/estadisticas`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        })

        if (!response.ok) throw new Error("Error al cargar estadísticas")

        const data = await response.json()

        // Actualizar elementos de estadísticas
        if (totalProductsElement) totalProductsElement.textContent = data.totalProductos || 0
        if (totalUnidadesElement) totalUnidadesElement.textContent = data.totalUnidades || 0
        if (totalAlmacenElement) totalAlmacenElement.textContent = data.categorias || 0
        if (clientesElement) clientesElement.textContent = data.clientes || 0
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
        mostrarToast("error", "Error", "No se pudieron cargar las estadísticas")
      }
    }

    async function cargarProductos() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        })

        if (!response.ok) throw new Error("Error al cargar productos")

        productos = await response.json()
        renderizarTablaProductos(productos)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        mostrarToast("error", "Error", "No se pudieron cargar los productos")
      }
    }

    // Funciones para renderizar la tabla
    function renderizarTablaProductos(productos) {
      if (!inventoryTableBody) return

      inventoryTableBody.innerHTML = ""

      if (productos.length === 0) {
        if (emptyState) emptyState.style.display = "block"
        return
      }

      if (emptyState) emptyState.style.display = "none"

      productos.forEach((producto) => {
        const row = document.createElement("tr")

        // Determinar el estado del producto basado en la cantidad
        let estadoClass = "badge-success"
        let estadoText = "Disponible"

        if (producto.cantidad <= 0) {
          estadoClass = "badge-danger"
          estadoText = "No disponible"
        }

        // Formatear fechas
        const fechaEntrada = new Date(producto.fechaEntrada)
        const fechaSalida = producto.fechaSalida ? new Date(producto.fechaSalida) : null

        const fechaEntradaFormateada = fechaEntrada.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        const fechaSalidaFormateada = fechaSalida
          ? fechaSalida.toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"

        row.innerHTML = `
                  <td>${producto.codigo}</td>
                  <td>${producto.nombre}</td>
                  <td>${getCategoryName(producto.categoria)}</td>
                  <td>${producto.cliente}</td>
                  <td class="text-right">${producto.cantidad}</td>
                  <td>${fechaEntradaFormateada}</td>
                  <td>${fechaSalidaFormateada}</td>
                  <td><span class="badge ${estadoClass}">${estadoText}</span></td>
                  <td>
                      <button class="action-btn" onclick="editarProducto(${producto.id})">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-btn delete" onclick="eliminarProducto(${producto.id})">
                          <i class="fas fa-trash-alt"></i>
                      </button>
                  </td>
              `

        inventoryTableBody.appendChild(row)
      })
    }

    // Funciones para manejar eventos
    function toggleMobileMenu() {
      if (!mobileMenu) return
      mobileMenu.classList.toggle("open")
    }

    function openModal(modal) {
      if (!modal) return
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }

    function closeModal(modal) {
      if (!modal) return
      modal.style.display = "none"
      document.body.style.overflow = ""

      // Limpiar formularios
      if (modal === addProductModal && addProductForm) {
        addProductForm.reset()
        clearErrors(addProductForm)
      }

      if (modal === editProductModal && editProductForm) {
        editProductForm.reset()
        clearErrors(editProductForm)
      }
    }

    async function handleAddProduct(e) {
      e.preventDefault()

      // Validar formulario
      if (!validateForm(addProductForm)) return

      try {
        const formData = new FormData(addProductForm)

        // Crear fecha de entrada (ahora)
        const fechaEntrada = new Date()

        // Crear fecha de salida (2 horas después)
        const fechaSalida = new Date(fechaEntrada)
        fechaSalida.setHours(fechaSalida.getHours() + 2)

        const productoData = {
          nombre: formData.get("name"),
          codigo: formData.get("sku"),
          cliente: formData.get("client"),
          categoria: formData.get("category"),
          ubicacion: formData.get("location"),
          cantidad: Number.parseInt(formData.get("quantity")),
          fechaEntrada: fechaEntrada.toISOString(),
          fechaSalida: fechaSalida.toISOString(), // Añadir fecha de salida automática
        }

        const response = await fetch(`${API_BASE_URL}/api/productos?usuario=${encodeURIComponent(userName)}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(productoData),
        })

        if (!response.ok) {
          throw new Error(`Error al crear el producto: ${response.status} ${response.statusText}`)
        }

        let data
        try {
          data = await response.json()
        } catch (e) {
          console.warn("No se pudo parsear la respuesta como JSON, pero la operación fue exitosa")
        }

        // Cerrar modal y actualizar datos
        closeModal(addProductModal)
        cargarEstadisticas()
        cargarProductos()
        mostrarToast("success", "Éxito", "Producto agregado correctamente con fecha de salida en 2 horas")
      } catch (error) {
        console.error("Error al agregar producto:", error)
        mostrarToast("error", "Error", error.message)
      }
    }

    // Definir la función handleEditProduct que faltaba
    async function handleEditProduct(e) {
      e.preventDefault()

      // Validar formulario
      if (!validateForm(editProductForm)) return

      try {
        const formData = new FormData(editProductForm)
        const productoId = formData.get("id")

        const productoData = {
          id: productoId,
          nombre: formData.get("name"),
          codigo: formData.get("sku"),
          cliente: formData.get("client"),
          categoria: formData.get("category"),
          ubicacion: formData.get("location"),
          cantidad: Number.parseInt(formData.get("quantity")),
        }

        const response = await fetch(`${API_BASE_URL}/api/productos/${productoId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(productoData),
        })

        if (!response.ok) {
          throw new Error(`Error al actualizar el producto: ${response.status} ${response.statusText}`)
        }

        // Cerrar modal y actualizar datos
        closeModal(editProductModal)
        cargarEstadisticas()
        cargarProductos()
        mostrarToast("success", "Éxito", "Producto actualizado correctamente")
      } catch (error) {
        console.error("Error al editar producto:", error)
        mostrarToast("error", "Error", error.message)
      }
    }

    async function handleDeleteProduct() {
      try {
        const productoId = document.getElementById("deleteProductId").value

        const response = await fetch(`${API_BASE_URL}/api/productos/${productoId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          throw new Error(`Error al eliminar el producto: ${response.status} ${response.statusText}`)
        }

        // Cerrar modal y actualizar datos
        closeModal(deleteProductModal)
        cargarEstadisticas()
        cargarProductos()
        mostrarToast("success", "Éxito", "Producto eliminado correctamente")
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        mostrarToast("error", "Error", error.message)
      }
    }

    function handleSearch() {
      const searchTerm = searchInput.value.toLowerCase()
      const filteredProducts = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm) ||
          producto.codigo.toLowerCase().includes(searchTerm) ||
          producto.cliente.toLowerCase().includes(searchTerm),
      )

      renderizarTablaProductos(filteredProducts)
    }

    function handleCategoryFilter() {
      const category = categoryFilter.value

      if (category === "all") {
        renderizarTablaProductos(productos)
        return
      }

      const filteredProducts = productos.filter((producto) => producto.categoria === category)

      renderizarTablaProductos(filteredProducts)
    }

    function handleSort(field) {
      if (currentSort.field === field) {
        // Cambiar dirección si es el mismo campo
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc"
      } else {
        // Nuevo campo, ordenar ascendente
        currentSort.field = field
        currentSort.direction = "asc"
      }

      // Ordenar productos
      const sortedProducts = [...productos].sort((a, b) => {
        let valueA, valueB

        // Obtener valores según el campo
        switch (field) {
          case "codigo":
            valueA = a.codigo
            valueB = b.codigo
            break
          case "nombre":
            valueA = a.nombre
            valueB = b.nombre
            break
          case "cantidad":
            valueA = a.cantidad
            valueB = b.cantidad
            break
          default:
            valueA = a[field]
            valueB = b[field]
        }

        // Comparar valores
        if (typeof valueA === "string") {
          if (currentSort.direction === "asc") {
            return valueA.localeCompare(valueB)
          } else {
            return valueB.localeCompare(valueA)
          }
        } else {
          if (currentSort.direction === "asc") {
            return valueA - valueB
          } else {
            return valueB - valueA
          }
        }
      })

      renderizarTablaProductos(sortedProducts)

      // Actualizar iconos de ordenamiento
      updateSortIcons(field)
    }

    // Funciones de utilidad
    function validateForm(form) {
      let isValid = true
      clearErrors(form)

      // Validar campos requeridos
      const requiredFields = form.querySelectorAll("[required]")
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          showError(field, "Este campo es obligatorio")
          isValid = false
        }
      })

      // Validar cantidad
      const quantityField = form.querySelector('[name="quantity"]')
      if (quantityField && quantityField.value && Number.parseInt(quantityField.value) < 0) {
        showError(quantityField, "La cantidad no puede ser negativa")
        isValid = false
      }

      return isValid
    }

    function showError(field, message) {
      const errorElement = field.parentElement.querySelector(".error-message")
      if (errorElement) {
        errorElement.textContent = message
      }
      field.classList.add("error")
    }

    function clearErrors(form) {
      const errorMessages = form.querySelectorAll(".error-message")
      errorMessages.forEach((element) => {
        element.textContent = ""
      })

      const errorFields = form.querySelectorAll(".error")
      errorFields.forEach((field) => {
        field.classList.remove("error")
      })
    }

    function updateSortIcons(activeField) {
      document.querySelectorAll("th[data-sort] i").forEach((icon) => {
        icon.className = "fas fa-sort"
      })

      const activeHeader = document.querySelector(`th[data-sort="${activeField}"] i`)
      if (activeHeader) {
        activeHeader.className = currentSort.direction === "asc" ? "fas fa-sort-up" : "fas fa-sort-down"
      }
    }

    function getCategoryName(categoryCode) {
      const categories = {
        electronics: "Electrónicos",
        furniture: "Muebles",
        clothing: "Ropa",
        food: "Alimentos",
        other: "Otros",
      }

      return categories[categoryCode] || categoryCode || "Sin categoría"
    }

    function mostrarToast(type, title, message) {
      const toastContainer = document.getElementById("toastContainer")
      if (!toastContainer) return

      const toast = document.createElement("div")
      toast.className = `toast toast-${type}`

      let icon = "info-circle"
      if (type === "success") icon = "check-circle"
      if (type === "error") icon = "exclamation-circle"

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

    // Funciones globales para acciones de la tabla
    window.editarProducto = (id) => {
      const producto = productos.find((p) => p.id === id)
      if (!producto) return

      // Llenar formulario de edición
      document.getElementById("editProductId").value = producto.id
      document.getElementById("editProductName").value = producto.nombre
      document.getElementById("editProductSku").value = producto.codigo
      document.getElementById("editProductCategory").value = producto.categoria || ""
      document.getElementById("editProductClient").value = producto.cliente || ""
      document.getElementById("editProductLocation").value = producto.ubicacion || ""
      document.getElementById("editProductQuantity").value = producto.cantidad

      // Abrir modal
      openModal(editProductModal)
    }

    window.eliminarProducto = (id) => {
      const producto = productos.find((p) => p.id === id)
      if (!producto) return

      // Actualizar mensaje de confirmación
      document.getElementById("deleteConfirmMessage").textContent =
        `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`

      // Guardar ID para eliminar
      document.getElementById("deleteProductId").value = producto.id

      // Abrir modal
      openModal(deleteProductModal)
    }
  }
})
