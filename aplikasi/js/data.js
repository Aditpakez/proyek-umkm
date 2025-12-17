// ===================================
// Data Management Layer
// ===================================

// LocalStorage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'umkm_products',
  CART: 'umkm_cart'
};

// Initialize products with seed data if empty
function initializeData() {
  const existingProducts = getProducts();

  if (existingProducts.length === 0) {
    const seedProducts = [
      {
        id: generateId(),
        name: 'Marshmallow Chocolate',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow lembut dengan rasa cokelat yang creamy dan manis, perfect untuk camilan atau dessert.',
        image: 'https://images.unsplash.com/photo-1635943835981-c97171003e23?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Coffee',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow dengan aroma kopi yang khas, perpaduan manis dan sedikit pahit yang unik.',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Espresso',
        category: 'makanan',
        price: 20000,
        stock: 100,
        description: 'Marshmallow premium dengan rasa espresso yang bold, ideal untuk pecinta kopi sejati.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Latte',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow lembut dengan rasa latte yang smooth dan creamy, cocok untuk semua usia.',
        image: 'https://images.unsplash.com/photo-1590080874088-eec64895b423?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Matcha',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow dengan rasa matcha premium dari Jepang, authentic dan menyegarkan.',
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Crème Brûlée',
        category: 'makanan',
        price: 17000,
        stock: 100,
        description: 'Marshmallow eksklusif dengan rasa crème brûlée yang mewah dan karamel yang lezat.',
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Pudding',
        category: 'makanan',
        price: 20000,
        stock: 100,
        description: 'Marshmallow super lembut dengan rasa pudding klasik yang manis dan creamy.',
        image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Tiramisu',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow inspired oleh dessert Italia legendaris dengan rasa kopi dan mascarpone.',
        image: 'https://images.unsplash.com/photo-1612182062422-2c7f53c3b6af?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Christmas Special',
        category: 'makanan',
        price: 25000,
        stock: 80,
        description: 'Marshmallow edisi spesial Natal dengan kombinasi rasa festive yang limited edition!',
        image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Cheesecake',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow dengan rasa cheesecake yang rich dan creamy, absolutely delicious.',
        image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Red Velvet',
        category: 'makanan',
        price: 20000,
        stock: 100,
        description: 'Marshmallow premium rasa red velvet dengan hint of cocoa dan cream cheese.',
        image: 'https://images.unsplash.com/photo-1601000938365-1c6e0bafe55e?w=400'
      },
      {
        id: generateId(),
        name: 'Marshmallow Strawberry',
        category: 'makanan',
        price: 15000,
        stock: 100,
        description: 'Marshmallow dengan rasa strawberry segar alami, manis dan fruity yang menyegarkan.',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
      }
    ];

    saveProducts(seedProducts);
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Product CRUD Operations
function getProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id);
}

function addProduct(product) {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: generateId()
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

function updateProduct(id, updates) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
    return products[index];
  }
  return null;
}

function deleteProduct(id) {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  saveProducts(filteredProducts);
  return true;
}

// Cart Operations
function getCart() {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const product = getProductById(productId);

  if (!product) return null;

  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      quantity,
      addedAt: Date.now()
    });
  }

  saveCart(cart);
  return cart;
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);

  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      return removeFromCart(productId);
    }
    saveCart(cart);
  }

  return cart;
}

function removeFromCart(productId) {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.productId !== productId);
  saveCart(filteredCart);
  return filteredCart;
}

function clearCart() {
  saveCart([]);
}

function getCartWithProducts() {
  const cart = getCart();
  const products = getProducts();

  return cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product); // Remove items with deleted products
}

function getCartTotal() {
  const cartWithProducts = getCartWithProducts();
  return cartWithProducts.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatNumber(number) {
  return new Intl.NumberFormat('id-ID').format(number);
}

// Initialize data on load
initializeData();
