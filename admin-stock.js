// ========================================
// ADMIN STOCK MANAGEMENT
// ========================================

const session = requireAuth();
if (!session) {
    // Will redirect to login
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeStock();
    });
}

let currentFilter = 'all';
let currentEditingId = null;

function initializeStock() {
    // Update pharmacy info
    document.getElementById('pharmacyName').textContent = session.pharmacyName;
    document.getElementById('pharmacyEmail').textContent = session.email;

    // Load products
    loadProducts();

    // Setup event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addProductBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('productForm').addEventListener('submit', handleSubmit);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Filter buttons
    document.querySelectorAll('.admin-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            loadProducts();
        });
    });
}

function loadProducts() {
    const products = getProducts(session.pharmacyId);
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Filter products
    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesFilter =
            currentFilter === 'all' ||
            (currentFilter === 'instock' && p.stock > p.threshold) ||
            (currentFilter === 'lowstock' && p.stock > 0 && p.stock <= p.threshold) ||
            (currentFilter === 'outofstock' && p.stock === 0);

        return matchesSearch && matchesFilter;
    });

    const tableBody = document.getElementById('productsTable');
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucun produit trouvé</td></tr>';
        return;
    }

    filtered.forEach(product => {
        const row = document.createElement('tr');
        const status = getStockStatus(product);

        row.innerHTML = `
            <td><strong>${product.name}</strong></td>
            <td>${product.stock}</td>
            <td>${product.price.toFixed(2)} €</td>
            <td>${product.threshold}</td>
            <td><span class="admin-stock-badge stock-${status.class}">${status.label}</span></td>
            <td>
                <div class="admin-table-actions">
                    <button class="admin-action-btn admin-action-edit" onclick="editProduct(${product.id})">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="admin-action-btn admin-action-delete" onclick="deleteProductConfirm(${product.id})">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStockStatus(product) {
    if (product.stock === 0) {
        return { class: 'out', label: 'Rupture' };
    } else if (product.stock <= product.threshold) {
        return { class: 'low', label: 'Stock bas' };
    } else {
        return { class: 'ok', label: 'En stock' };
    }
}

function openAddModal() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
    const products = getProducts(session.pharmacyId);
    const product = products.find(p => p.id === id);

    if (product) {
        currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Modifier le produit';
        document.getElementById('productName').value = product.name;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productThreshold').value = product.threshold;
        document.getElementById('productModal').classList.add('active');
    }
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    currentEditingId = null;
}

function handleSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        stock: parseInt(document.getElementById('productStock').value),
        price: parseFloat(document.getElementById('productPrice').value),
        threshold: parseInt(document.getElementById('productThreshold').value),
        pharmacyId: session.pharmacyId
    };

    if (currentEditingId) {
        // Update
        updateProduct(currentEditingId, productData);
    } else {
        // Add
        addProduct(productData);
    }

    closeModal();
    loadProducts();
}

function deleteProductConfirm(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        deleteProduct(id);
        loadProducts();
    }
}

function handleSearch() {
    loadProducts();
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeModal();
    }
});

console.log('📦 Stock management initialized');
