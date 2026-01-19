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
                image: 'assets/chocolate.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Coffee',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow dengan aroma kopi yang khas, perpaduan manis dan sedikit pahit yang unik.',
                image: 'assets/coffee.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Espresso',
                category: 'makanan',
                price: 20000,
                stock: 100,
                description: 'Marshmallow premium dengan rasa espresso yang bold, ideal untuk pecinta kopi sejati.',
                image: 'assets/espresso.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Latte',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow lembut dengan rasa latte yang smooth dan creamy, cocok untuk semua usia.',
                image: 'assets/latte.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Matcha',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow dengan rasa matcha premium dari Jepang, authentic dan menyegarkan.',
                image: 'assets/matcha.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Crème Brûlée',
                category: 'makanan',
                price: 17000,
                stock: 100,
                description: 'Marshmallow eksklusif dengan rasa crème brûlée yang mewah dan karamel yang lezat.',
                image: 'assets/cremeBruelee.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Pudding',
                category: 'makanan',
                price: 20000,
                stock: 100,
                description: 'Marshmallow super lembut dengan rasa pudding klasik yang manis dan creamy.',
                image: 'assets/pudding.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Tiramisu',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow inspired oleh dessert Italia legendaris dengan rasa kopi dan mascarpone.',
                image: 'assets/tiramisu.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Christmas Special',
                category: 'makanan',
                price: 25000,
                stock: 80,
                description: 'Marshmallow edisi spesial Natal dengan kombinasi rasa festive yang limited edition!',
                image: 'assets/christmas.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Cheesecake',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow dengan rasa cheesecake yang rich dan creamy, absolutely delicious.',
                image: 'assets/cheeseCake.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Red Velvet',
                category: 'makanan',
                price: 20000,
                stock: 100,
                description: 'Marshmallow premium rasa red velvet dengan hint of cocoa dan cream cheese.',
                image: 'assets/redVelvet.png'
            },
            {
                id: generateId(),
                name: 'Marshmallow Strawberry',
                category: 'makanan',
                price: 15000,
                stock: 100,
                description: 'Marshmallow dengan rasa strawberry segar alami, manis dan fruity yang menyegarkan.',
                image: 'assets/strawberry.png'
            }
        ];

        saveProducts(seedProducts);
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
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