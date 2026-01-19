// ===================================
// Admin Page Logic
// ===================================

let currentEditId = null;
let deleteProductId = null;
let uploadedImageData = null;
const DEFAULT_IMAGE = 'assets/default-marshmallow.png';


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

  // Image Upload
  const imageInput = document.getElementById('productImage');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }

  // Drag and Drop Upload
  const uploadWrapper = document.querySelector('.image-upload-wrapper');
  if (uploadWrapper) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadWrapper.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadWrapper.addEventListener(eventName, () => {
        uploadWrapper.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadWrapper.addEventListener(eventName, () => {
        uploadWrapper.classList.remove('dragover');
      }, false);
    });

    // Handle dropped files
    uploadWrapper.addEventListener('drop', handleDrop, false);
  }

  // Close modal on overlay click
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// Prevent default drag behaviors
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Handle dropped files
function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  if (files.length > 0) {
    const file = files[0];
    processImageFile(file);
  }
}

// Process image file (shared between drag-drop and file input)
function processImageFile(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Format gambar tidak valid. Gunakan JPG, PNG, GIF, atau WebP', 'error');
    uploadedImageData = null;
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('Ukuran gambar terlalu besar. Maksimal 5MB', 'error');
    uploadedImageData = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageData = event.target.result;
    updateImagePreview(uploadedImageData);
    showNotification('Gambar berhasil diupload!', 'success');
  };
  reader.onerror = () => {
    showNotification('Gagal membaca file gambar', 'error');
    uploadedImageData = null;
  };
  reader.readAsDataURL(file);
}

// Handle Image Upload - Convert to Base64
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    uploadedImageData = null;
    updateImagePreview(null);
    return;
  }
  processImageFile(file);
}

// Update image preview
function updateImagePreview(imageSrc) {
  const previewContainer = document.getElementById('imagePreviewContainer');
  if (previewContainer) {
    if (imageSrc) {
      previewContainer.innerHTML = `
        <img src="${imageSrc}" alt="Preview" class="image-preview">
        <button type="button" class="btn-remove-image" onclick="removeImagePreview()">✕</button>
      `;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.innerHTML = '';
      previewContainer.style.display = 'none';
    }
  }
}

// Remove image preview
function removeImagePreview() {
  uploadedImageData = null;
  const imageInput = document.getElementById('productImage');
  if (imageInput) imageInput.value = '';
  updateImagePreview(null);
}

// Render Functions
function renderProducts(searchTerm = '') {
  const products = getProducts();
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="5">
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
        src="${product.image || DEFAULT_IMAGE}"
        alt="${product.name}"
        class="product-thumbnail"
        onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'"
        >
      </td>
      <td>
        <div class="product-name">${product.name}</div>
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
  uploadedImageData = null;
  document.getElementById('modalTitle').textContent = 'Tambah Produk';
  productForm.reset();
  document.getElementById('productId').value = '';
  updateImagePreview(null);
  productModal.classList.add('active');
}

function openEditModal(productId) {
  currentEditId = productId;
  uploadedImageData = null;
  const product = getProductById(productId);

  if (!product) return;

  document.getElementById('modalTitle').textContent = 'Edit Produk';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productDescription').value = product.description;

  // Show current image preview if exists
  if (product.image) {
    updateImagePreview(product.image);
  } else {
    updateImagePreview(null);
  }

  productModal.classList.add('active');
}

function closeProductModal() {
  productModal.classList.remove('active');
  productForm.reset();
  currentEditId = null;
  uploadedImageData = null;
  updateImagePreview(null);
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
async function handleFormSubmit(e) {
  e.preventDefault();

  // Determine image source
  let imageSource = DEFAULT_IMAGE;

  if (uploadedImageData) {
    // Use newly uploaded image
    imageSource = uploadedImageData;
  } else if (currentEditId) {
    // Keep existing image when editing
    const existingProduct = getProductById(currentEditId);
    if (existingProduct && existingProduct.image) {
      imageSource = existingProduct.image;
    }
  }

  const productData = {
    name: document.getElementById('productName').value.trim(),
    category: 'makanan',
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    description: document.getElementById('productDescription').value.trim(),
    image: imageSource
  };

  if (currentEditId) {
    // Update existing product
    await updateProduct(currentEditId, productData);
    showNotification('Marshmallow berhasil diupdate!', 'success');
  } else {
    // Add new product
    await addProduct(productData);
    showNotification('Marshmallow berhasil ditambahkan!', 'success');
  }

  closeProductModal();
  renderProducts();
  renderStats();
}

function handleDelete() {
  if (!deleteProductId) return;
  (async () => {
    const ok = await deleteProduct(deleteProductId);
    if (ok) showNotification('Marshmallow berhasil dihapus!', 'success');
    else showNotification('Gagal menghapus produk', 'error');

    closeDeleteModal();
    renderProducts();
    renderStats();
  })();
}

function handleSearch(e) {
  const searchTerm = e.target.value;
  renderProducts(searchTerm);
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-gradient)' : type === 'error' ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' : 'var(--primary-gradient)'};
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