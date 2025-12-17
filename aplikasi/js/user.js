// ===================================
// User/Customer Page Logic
// ===================================

let currentCategory = 'all';
let selectedProductId = null;
let searchQuery = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItems = document.getElementById('cartItems');
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');
const productModal = document.getElementById('productModal');
const checkoutModal = document.getElementById('checkoutModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Category Filter
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', handleCategoryClick);
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Cart Toggle
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // Product Modal
  document.getElementById('closeModalBtn').addEventListener('click', closeProductModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeProductModal);
  document.getElementById('addToCartFromModal').addEventListener('click', addToCartFromModal);

  // Checkout
  document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
  document.getElementById('closeCheckoutModal').addEventListener('click', closeCheckoutModal);
  document.getElementById('continueShoppingBtn').addEventListener('click', closeCheckoutModal);

  // Close modals on overlay click
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });
}

// Render Functions
function renderProducts() {
  const products = getProducts();
  let filteredProducts = currentCategory === 'all'
    ? products
    : products.filter(p => p.category === currentCategory);

  // Apply search filter
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3 class="empty-state-title">Tidak Ada Produk</h3>
          <p class="empty-state-text">
            ${searchQuery ? 'Tidak ditemukan produk yang cocok dengan pencarian Anda' : 'Kategori ini belum memiliki produk'}
          </p>
        </div>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filteredProducts.map(product => `
    <div class="product-card fade-in" onclick="openProductModal('${product.id}')">
      <div class="product-image-wrapper">
        <img 
          src="${product.image || 'https://via.placeholder.com/400'}" 
          alt="${product.name}"
          class="product-image"
          onerror="this.src='https://via.placeholder.com/400?text=No+Image'"
        >
        <span class="product-category-tag">${getCategoryIcon(product.category)} ${getCategoryLabel(product.category)}</span>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <div>
            <div class="product-price-tag">${formatCurrency(product.price)}</div>
            <div class="product-stock-info">Stok: ${formatNumber(product.stock)}</div>
          </div>
        </div>
        <button 
          class="btn btn-primary btn-add-to-cart" 
          onclick="event.stopPropagation(); quickAddToCart('${product.id}')"
        >
          + Tambah ke Keranjang
        </button>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  const cart = getCartWithProducts();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Keranjang Kosong</h3>
        <p>Belum ada produk di keranjang belanja Anda</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img 
        src="${item.product.image || 'https://via.placeholder.com/80'}" 
        alt="${item.product.name}"
        class="cart-item-image"
        onerror="this.src='https://via.placeholder.com/80?text=No+Image'"
      >
      <div class="cart-item-info">
        <div class="cart-item-title">${item.product.name}</div>
        <div class="cart-item-price">${formatCurrency(item.product.price)}</div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="decreaseQuantity('${item.productId}')">−</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="increaseQuantity('${item.productId}')">+</button>
          <button class="cart-item-remove" onclick="removeFromCartUI('${item.productId}')" title="Hapus">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();

  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
  cartTotal.textContent = formatCurrency(total);

  renderCart();
}

// Category Filter
function handleCategoryClick(e) {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  e.target.classList.add('active');
  currentCategory = e.target.dataset.category;
  renderProducts();
}

// Search Handler
function handleSearch(e) {
  searchQuery = e.target.value;
  renderProducts();
}

// Cart Functions
function openCart() {
  cartSidebar.classList.add('active');
  cartBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('active');
  cartBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function quickAddToCart(productId) {
  const product = getProductById(productId);

  if (!product) {
    showNotification('Produk tidak ditemukan', 'error');
    return;
  }

  if (product.stock <= 0) {
    showNotification('Stok habis', 'error');
    return;
  }

  addToCart(productId, 1);
  updateCartUI();
  showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
}

function increaseQuantity(productId) {
  const product = getProductById(productId);
  const cart = getCart();
  const cartItem = cart.find(item => item.productId === productId);

  if (cartItem && cartItem.quantity >= product.stock) {
    showNotification('Stok tidak mencukupi', 'error');
    return;
  }

  updateCartQuantity(productId, cartItem.quantity + 1);
  updateCartUI();
}

function decreaseQuantity(productId) {
  const cart = getCart();
  const cartItem = cart.find(item => item.productId === productId);

  if (cartItem && cartItem.quantity > 1) {
    updateCartQuantity(productId, cartItem.quantity - 1);
    updateCartUI();
  } else {
    removeFromCartUI(productId);
  }
}

function removeFromCartUI(productId) {
  removeFromCart(productId);
  updateCartUI();
  showNotification('Produk dihapus dari keranjang', 'success');
}

// Product Modal
function openProductModal(productId) {
  selectedProductId = productId;
  const product = getProductById(productId);

  if (!product) return;

  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductImage').src = product.image || 'https://via.placeholder.com/400';
  document.getElementById('modalProductImage').alt = product.name;
  document.getElementById('modalProductCategory').textContent = getCategoryLabel(product.category);
  document.getElementById('modalProductPrice').textContent = formatCurrency(product.price);
  document.getElementById('modalProductStock').textContent = `${formatNumber(product.stock)} unit tersedia`;
  document.getElementById('modalProductDescription').textContent = product.description;

  productModal.classList.add('active');
}

function closeProductModal() {
  productModal.classList.remove('active');
  selectedProductId = null;
}

function addToCartFromModal() {
  if (selectedProductId) {
    quickAddToCart(selectedProductId);
    closeProductModal();
  }
}

// Checkout
function handleCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    showNotification('Keranjang belanja kosong', 'error');
    return;
  }

  // Validate stock availability before checkout
  const cartWithProducts = getCartWithProducts();
  for (const item of cartWithProducts) {
    if (item.product.stock < item.quantity) {
      showNotification(`Stok ${item.product.name} tidak mencukupi. Tersedia: ${item.product.stock}`, 'error');
      return;
    }
  }

  const total = getCartTotal();
  document.getElementById('checkoutTotal').textContent = formatCurrency(total);

  // Reduce product stock based on cart quantities
  cart.forEach(item => {
    const product = getProductById(item.productId);
    if (product) {
      const newStock = product.stock - item.quantity;
      updateProduct(item.productId, { stock: newStock });
    }
  });

  // Clear cart
  clearCart();
  updateCartUI();

  // Refresh product display to show updated stock
  renderProducts();

  closeCart();

  // Show success modal
  checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('active');
  // Refresh products to show updated stock
  renderProducts();
}

// Utility Functions
function getCategoryLabel(category) {
  const labels = {
    'makanan': 'Makanan',
    'fashion': 'Fashion',
    'aksesori': 'Aksesori',
    'dekorasi': 'Dekorasi',
    'lainnya': 'Lainnya'
  };
  return labels[category] || category;
}

function getCategoryIcon(category) {
  const icons = {
    'makanan': '🍔',
    'fashion': '👕',
    'aksesori': '💍',
    'dekorasi': '🎨',
    'lainnya': '📦'
  };
  return icons[category] || '📦';
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-gradient)' : type === 'error' ? 'var(--secondary-gradient)' : 'var(--primary-gradient)'};
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    font-weight: 600;
    animation: slideInRight var(--transition-base);
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

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
