// ===================================
// Admin Page Logic
// ===================================

let currentEditId = null;
let deleteProductId = null;

// DOM Elements
const productsTableBody = document.getElementById('productsTableBody');
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const searchInput = document.getElementById('searchInput');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderStats();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Add Product Button
  document.getElementById('addProductBtn').addEventListener('click', openAddModal);

  // Modal Close Buttons
  document.getElementById('closeModal').addEventListener('click', closeProductModal);
  document.getElementById('cancelBtn').addEventListener('click', closeProductModal);

  // Delete Modal
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', handleDelete);

  // Form Submit
  productForm.addEventListener('submit', handleFormSubmit);

  // Search
  searchInput.addEventListener('input', handleSearch);

  // Close modal on overlay click
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// Render Functions
function renderProducts(searchTerm = '') {
  const products = getProducts();
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3 class="empty-state-title">
              ${searchTerm ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
            </h3>
            <p class="empty-state-text">
              ${searchTerm ? 'Coba kata kunci lain' : 'Mulai tambahkan marshmallow pertama Anda'}
            </p>
            ${!searchTerm ? '<button class="btn btn-primary" onclick="openAddModal()">+ Tambah Marshmallow</button>' : ''}
          </div>
        </td>
      </tr>
    `;
    return;
  }

  productsTableBody.innerHTML = filteredProducts.map(product => `
    <tr>
      <td class="product-image-cell">
        <img 
          src="${product.image || 'https://via.placeholder.com/60'}" 
          alt="${product.name}"
          class="product-thumbnail"
          onerror="this.src='https://via.placeholder.com/60?text=No+Image'"
        >
      </td>
      <td>
        <div class="product-name">${product.name}</div>
      </td>
      <td>
        <span class="category-badge">${getCategoryLabel(product.category)}</span>
      </td>
      <td>
        <span class="product-price">${formatCurrency(product.price)}</span>
      </td>
      <td>
        <span class="product-stock ${product.stock < 20 ? 'stock-low' : 'stock-ok'}">
          ${formatNumber(product.stock)} unit
        </span>
      </td>
      <td>
        <div class="product-actions">
          <button 
            class="btn-icon btn-edit" 
            onclick="openEditModal('${product.id}')"
            title="Edit"
          >
            ✏️
          </button>
          <button 
            class="btn-icon btn-delete" 
            onclick="openDeleteModal('${product.id}')"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStats() {
  const products = getProducts();
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  document.getElementById('totalProducts').textContent = formatNumber(totalProducts);
  document.getElementById('totalStock').textContent = formatNumber(totalStock);
  document.getElementById('totalValue').textContent = formatCurrency(totalValue);
}

// Modal Functions
function openAddModal() {
  currentEditId = null;
  document.getElementById('modalTitle').textContent = 'Tambah Produk';
  productForm.reset();
  document.getElementById('productId').value = '';
  productModal.classList.add('active');
}

function openEditModal(productId) {
  currentEditId = productId;
  const product = getProductById(productId);

  if (!product) return;

  document.getElementById('modalTitle').textContent = 'Edit Produk';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productImage').value = product.image || '';

  productModal.classList.add('active');
}

function closeProductModal() {
  productModal.classList.remove('active');
  productForm.reset();
  currentEditId = null;
}

function openDeleteModal(productId) {
  deleteProductId = productId;
  const product = getProductById(productId);

  if (!product) return;

  document.getElementById('deleteProductName').textContent = product.name;
  deleteModal.classList.add('active');
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  deleteProductId = null;
}

// Form Handling
function handleFormSubmit(e) {
  e.preventDefault();

  const productData = {
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    description: document.getElementById('productDescription').value.trim(),
    image: document.getElementById('productImage').value.trim() || 'https://via.placeholder.com/400?text=' + encodeURIComponent(document.getElementById('productName').value)
  };

  if (currentEditId) {
    // Update existing product
    updateProduct(currentEditId, productData);
    showNotification('Marshmallow berhasil diupdate!', 'success');
  } else {
    // Add new product
    addProduct(productData);
    showNotification('Marshmallow berhasil ditambahkan!', 'success');
  }

  closeProductModal();
  renderProducts();
  renderStats();
}

function handleDelete() {
  if (!deleteProductId) return;

  deleteProduct(deleteProductId);
  showNotification('Marshmallow berhasil dihapus!', 'success');

  closeDeleteModal();
  renderProducts();
  renderStats();
}

function handleSearch(e) {
  const searchTerm = e.target.value;
  renderProducts(searchTerm);
}

// Utility Functions
function getCategoryLabel(category) {
  const labels = {
    'makanan': 'Makanan & Minuman',
    'fashion': 'Fashion',
    'aksesori': 'Aksesori',
    'dekorasi': 'Dekorasi & Kerajinan',
    'lainnya': 'Lainnya'
  };
  return labels[category] || category;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-gradient)' : 'var(--primary-gradient)'};
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    font-weight: 600;
    animation: slideInRight var(--transition-base);
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = '';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.3s ease';

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
