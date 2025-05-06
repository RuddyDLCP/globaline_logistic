let products = [];

const API_BASE_URL = 'http://localhost:8080/api/products';

// Cargar productos desde la API
async function loadProductsFromStorage(filters = {}, sort = {}) {
    let url = API_BASE_URL;
    const queryParams = [];

    if (filters.category && filters.category !== 'all') {
        queryParams.push(`category=${filters.category}`);
    }
    if (filters.search) {
        queryParams.push(`search=${filters.search}`);
    }
    if (sort.column) {
        queryParams.push(`sortBy=${sort.column}`);
        queryParams.push(`sortOrder=${sort.direction}`);
    }

    if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Manejo de error 403 y otros errores de respuesta
            if (response.status === 403) {
                showToast('Error', 'No tienes permiso para acceder a esta información. Verifica tu autenticación.', 'error');
            } else {
                showToast('Error', `Error al cargar productos: ${response.status} - ${response.statusText}`, 'error');
            }
            console.error('Error al cargar productos desde la API:', response.status, response.statusText);
            return; // Importante: Detener la ejecución si hay un error
        }
        products = await response.json();
        renderInventoryTable(products);
        updateStats();
    } catch (error) {
        // Manejo de errores de red u otros errores
        console.error('Error al cargar productos desde la API:', error);
        showToast('Error', 'No se pudieron cargar los productos. Verifica tu conexión de red.', 'error');
    }
}

function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const lowStockItems = products.filter(product => product.quantity < 10).length;
    const categories = [...new Set(products.map(product => product.category))].length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('lowStock').textContent = lowStockItems;
    document.getElementById('categories').textContent = categories;
}

function renderInventoryTable(filteredProducts = null) {
    const tableBody = document.getElementById('inventoryTableBody');
    const emptyState = document.getElementById('emptyState');

    tableBody.innerHTML = '';

    const productsToRender = filteredProducts || products;

    if (productsToRender.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    productsToRender.forEach(product => {
        const row = document.createElement('tr');

        let stockStatus = '';
        if (product.quantity <= 0) {
            stockStatus = '<span class="badge badge-danger">Sin stock</span>';
        } else if (product.quantity < 10) {
            stockStatus = '<span class="badge badge-warning">Stock bajo</span>';
        } else {
            stockStatus = '<span class="badge badge-success">En stock</span>';
        }

        row.innerHTML = `
        <td>${product.sku}</td>
        <td>${product.name}</td>
        <td>${getCategoryName(product.category)}</td>
        <td class="text-right">$${product.price ? product.price.toFixed(2) : 'N/A'}</td>
        <td class="text-right">${product.quantity !== undefined ? product.quantity : 'N/A'}</td>
        <td>${stockStatus}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${product.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn delete" data-id="${product.id}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

        tableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditProduct);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteProduct);
    });
}

function getCategoryName(category) {
    const categories = {
        'electronics': 'Electrónicos',
        'furniture': 'Muebles',
        'clothing': 'Ropa',
        'food': 'Alimentos',
        'other': 'Otros'
    };
    return categories[category] || category;
}

function setupEventListeners() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
    });

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', handleSort);
    });

    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeAddModal = document.getElementById('closeAddModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const addProductForm = document.getElementById('addProductForm');

    addProductBtn.addEventListener('click', function () {
        addProductModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        clearFormErrors(addProductForm);
        addProductForm.reset();
    });

    closeAddModal.addEventListener('click', function () {
        addProductModal.style.display = 'none';
        document.body.style.overflow = '';
        clearFormErrors(addProductForm);
        addProductForm.reset();
    });

    cancelAddBtn.addEventListener('click', function () {
        addProductModal.style.display = 'none';
        document.body.style.overflow = '';
        clearFormErrors(addProductForm);
        addProductForm.reset();
    });

    addProductForm.addEventListener('submit', handleAddProduct); // Asegúrate de que este evento esté aquí

    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editProductForm = document.getElementById('editProductForm');

    closeEditModal.addEventListener('click', function () {
        document.getElementById('editProductModal').style.display = 'none';
        document.body.style.overflow = '';
        clearFormErrors(editProductForm);
    });

    cancelEditBtn.addEventListener('click', function () {
        document.getElementById('editProductModal').style.display = 'none';
        document.body.style.overflow = '';
        clearFormErrors(editProductForm);
    });

    editProductForm.addEventListener('submit', handleUpdateProduct);

    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    closeDeleteModal.addEventListener('click', function () {
        document.getElementById('deleteProductModal').style.display = 'none';
        document.body.style.overflow = '';
    });

    cancelDeleteBtn.addEventListener('click', function () {
        document.getElementById('deleteProductModal').style.display = 'none';
        document.body.style.overflow = '';
    });

    confirmDeleteBtn.addEventListener('click', confirmDeleteProduct);

    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryValue = document.getElementById('categoryFilter').value;

    loadProductsFromStorage({ search: searchTerm, category: categoryValue }, currentSort);
}

let currentSort = {
    column: null,
    direction: 'asc'
};

function handleSort(event) {
    const column = event.currentTarget.getAttribute('data-sort');

    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    document.querySelectorAll('th[data-sort] i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const icon = event.currentTarget.querySelector('i');
    icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';

    loadProductsFromStorage({}, currentSort);
}

function validateForm(form, isEdit = false) {
    const nameInput = form.querySelector('[name="name"]');
    const skuInput = form.querySelector('[name="sku"]');
    const categoryInput = form.querySelector('[name="category"]');
    const priceInput = form.querySelector('[name="price"]');
    const quantityInput = form.querySelector('[name="quantity"]');

    const prefix = isEdit ? 'edit' : '';

    let isValid = true;

    if (nameInput.value.trim().length < 2) {
        document.getElementById(`${prefix}NameError`).textContent = 'El nombre debe tener al menos 2 caracteres';
        isValid = false;
    } else {
        document.getElementById(`${prefix}NameError`).textContent = '';
    }

    if (skuInput.value.trim().length < 3) {
        document.getElementById(`${prefix}SkuError`).textContent = 'El SKU debe tener al menos 3 caracteres';
        isValid = false;
    } else {
        document.getElementById(`${prefix}SkuError`).textContent = '';
    }

    if (!categoryInput.value) {
        document.getElementById(`${prefix}CategoryError`).textContent = 'Selecciona una categoría';
        isValid = false;
    } else {
        document.getElementById(`${prefix}CategoryError`).textContent = '';
    }

    if (isNaN(parseFloat(priceInput.value)) || parseFloat(priceInput.value) <= 0) {
        document.getElementById(`${prefix}PriceError`).textContent = 'El precio debe ser un número mayor a 0';
        isValid = false;
    } else {
        document.getElementById(`${prefix}PriceError`).textContent = '';
    }

    if (isNaN(parseInt(quantityInput.value)) || parseInt(quantityInput.value) < 0 || !Number.isInteger(Number(quantityInput.value))) {
        document.getElementById(`${prefix}QuantityError`).textContent = 'La cantidad debe ser un número entero no negativo';
        isValid = false;
    } else {
        document.getElementById(`${prefix}QuantityError`).textContent = '';
    }

    return isValid;
}

function clearFormErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

async function handleAddProduct(event) { // Esta función maneja el evento de envío del formulario
    event.preventDefault();

    if (!validateForm(this)) {
        return;
    }

    const formData = new FormData(this);
    const productData = {
        sku: formData.get('sku'),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        description: formData.get('description'),
        location: formData.get('location')
    };

    console.log('Datos a enviar a la API:', productData);

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al agregar producto:', errorData);
            showToast('Error', 'No se pudo agregar el producto.', 'error');
            return;
        }

        const newProduct = await response.json();
        console.log('Respuesta de la API:', newProduct);

        products.push(newProduct);
        updateStats();
        renderInventoryTable(products);
        document.getElementById('addProductModal').style.display = 'none';
        document.body.style.overflow = '';
        this.reset();
        clearFormErrors(this);
        showToast('Producto agregado', 'El producto ha sido agregado exitosamente.', 'success');
    } catch (error) {
        console.error('Error al enviar la petición de agregar producto:', error);
        showToast('Error', 'Error de conexión al agregar el producto.', 'error');
    }
}


function handleEditProduct(event) {
    const productId = event.currentTarget.getAttribute('data-id');
    const product = products.find(p => p.id === productId);

    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductSku').value = product.sku;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductQuantity').value = product.quantity;
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductLocation').value = product.location || '';

    document.getElementById('editProductModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    clearFormErrors(document.getElementById('editProductForm'));
}

async function handleUpdateProduct(event) {
    event.preventDefault();

    if (!validateForm(this, true)) {
        return;
    }

    const productId = document.getElementById('editProductId').value;
    const formData = new FormData(this);
    const productData = {
        sku: formData.get('sku'),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        description: formData.get('description'),
        location: formData.get('location')
    };

    console.log('Datos a enviar a la API:', productData);

    try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al actualizar producto:', errorData);
            showToast('Error', 'No se pudo actualizar el producto.', 'error');
            return;
        }

        const updatedProduct = await response.json();
        console.log('Respuesta de la API:', updatedProduct);

        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = updatedProduct;
        }
        updateStats();
        renderInventoryTable(products);
        document.getElementById('editProductModal').style.display = 'none';
        document.body.style.overflow = '';
        showToast('Producto actualizado', 'El producto ha sido actualizado exitosamente.', 'success');
    } catch (error) {
        console.error('Error al enviar la petición de actualizar producto:', error);
        showToast('Error', 'Error de conexión al actualizar el producto.', 'error');
    }
}

function handleDeleteProduct(event) {
    const productId = event.currentTarget.getAttribute('data-id');
    const product = products.find(p => p.id === productId);

    if (!product) return;

    document.getElementById('deleteProductId').value = productId;
    document.getElementById('deleteConfirmMessage').textContent =
        `Esta acción eliminará permanentemente el producto "${product.name}" del inventario. Esta acción no se puede deshacer.`;

    document.getElementById('deleteProductModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function confirmDeleteProduct() {
    const productId = document.getElementById('deleteProductId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al eliminar producto:', errorData);
            showToast('Error', 'No se pudo eliminar el producto.', 'error');
            return;
        }

        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            const deletedProduct = products.splice(index, 1)[0];
            updateStats();
            renderInventoryTable(products);
            showToast('Producto eliminado', `El producto "${deletedProduct.name}" ha sido eliminado exitosamente.`, 'info');
        }
        document.getElementById('deleteProductModal').style.display = 'none';
        document.body.style.overflow = '';
    } catch (error) {
        console.error('Error al enviar la petición de eliminar producto:', error);
        showToast('Error', 'Error de conexión al eliminar el producto.', 'error');
    }
}

function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    loadProductsFromStorage();
    setupEventListeners();
});
