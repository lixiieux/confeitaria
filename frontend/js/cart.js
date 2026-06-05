// Shopping Cart Manager

// Get current cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartBadge();
    renderCartDrawer();
}

// Add item to cart
function addToCart(productName, quantity, price, image) {
    let cart = getCart();
    const existing = cart.find(item => item.product === productName);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            product: productName,
            quantity: quantity,
            unit_price: price,
            image: image || 'assets/hero_cake.png'
        });
    }
    saveCart(cart);
    
    // Animate badge
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => { badge.style.transform = 'scale(1)'; }, 300);
    }
}

// Update cart item quantity
function updateCartQuantity(productName, delta) {
    let cart = getCart();
    const item = cart.find(item => item.product === productName);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.product !== productName);
    }
    saveCart(cart);
}

// Remove item from cart
function removeFromCart(productName) {
    let cart = getCart();
    cart = cart.filter(item => item.product !== productName);
    saveCart(cart);
}

// Clear cart
function clearCart() {
    localStorage.removeItem('cart');
    renderCartBadge();
    renderCartDrawer();
}

// Calculate total price
function getCartTotal() {
    return getCart().reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
}

// Calculate total item count
function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

// Toggle Cart Drawer visibility
function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer || !backdrop) return;
    
    drawer.classList.toggle('open');
    backdrop.classList.toggle('open');
}

// Render Cart Badge count
function renderCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const count = getCartCount();
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Render Cart Drawer list
function renderCartDrawer() {
    const body = document.getElementById('cart-drawer-items');
    const totalEl = document.getElementById('cart-drawer-total');
    const btnCheckout = document.getElementById('cart-drawer-checkout-btn');
    
    if (!body) return;
    
    const cart = getCart();
    if (cart.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; margin-top: 50px; color: var(--orange-dark);">
                <div style="margin-bottom: 15px; color: var(--orange-dark); display: flex; justify-content: center; align-items: center;">
                    <svg class="icon-svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </div>
                <p style="font-size: 18px; font-weight: 600; margin-top: 10px;">Seu carrinho está vazio</p>
                <p style="font-size: 14px; margin-top: 5px;">Que tal adicionar alguns bolos saudáveis?</p>
            </div>
        `;
        if (totalEl) totalEl.innerText = 'R$ 0,00';
        if (btnCheckout) btnCheckout.disabled = true;
        return;
    }
    
    body.innerHTML = cart.map(item => `
        <div class="cart-drawer-item">
            <img class="cart-drawer-item-img" src="${item.image}" alt="${item.product}">
            <div class="cart-drawer-item-info">
                <div class="cart-drawer-item-name">${item.product}</div>
                <div class="cart-drawer-item-price">R$ ${item.unit_price.toFixed(2)}</div>
                <div class="cart-drawer-item-qty">
                    <button class="qty-btn" style="width: 24px; height: 24px; font-size: 14px;" onclick="updateCartQuantity('${item.product}', -1)">-</button>
                    <span style="font-weight:600;">${item.quantity}</span>
                    <button class="qty-btn" style="width: 24px; height: 24px; font-size: 14px;" onclick="updateCartQuantity('${item.product}', 1)">+</button>
                </div>
            </div>
            <button class="cart-drawer-remove" onclick="removeFromCart('${item.product}')">Excluir</button>
        </div>
    `).join('');
    
    if (totalEl) totalEl.innerText = `R$ ${getCartTotal().toFixed(2)}`;
    if (btnCheckout) btnCheckout.disabled = false;
}

// Initial draw on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Add Cart Drawer to DOM if not already present
    if (!document.getElementById('cart-drawer')) {
        const backdrop = document.createElement('div');
        backdrop.id = 'drawer-backdrop';
        backdrop.className = 'drawer-backdrop';
        backdrop.onclick = toggleCartDrawer;
        document.body.appendChild(backdrop);

        const drawer = document.createElement('div');
        drawer.id = 'cart-drawer';
        drawer.className = 'drawer right';
        drawer.innerHTML = `
            <div class="drawer-header">
                <h3>Seu Carrinho</h3>
                <button class="drawer-close" onclick="toggleCartDrawer()">×</button>
            </div>
            <div class="drawer-body" id="cart-drawer-items"></div>
            <div class="drawer-footer">
                <div class="cart-total-row">
                    <span>Total</span>
                    <span id="cart-drawer-total">R$ 0,00</span>
                </div>
                <button id="cart-drawer-checkout-btn" class="btn-primary" style="width: 100%; height: 60px; font-size: 20px;" onclick="window.location.href='carrinho.html'">
                    Finalizar Compra
                </button>
            </div>
        `;
        document.body.appendChild(drawer);
    }
    
    // Add Click listener to Cart Icon (support layout links redirecting or drawer toggles)
    const cartIcon = document.querySelector('.btn-cart-icon');
    if (cartIcon) {
        cartIcon.removeAttribute('onclick'); // override inline redirect
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            // If on checkout page, don't open drawer, just let them see the screen
            if (window.location.pathname.includes('carrinho.html')) return;
            toggleCartDrawer();
        });
    }

    renderCartBadge();
    renderCartDrawer();
});
