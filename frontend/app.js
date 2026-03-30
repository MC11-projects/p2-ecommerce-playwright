// Configuration - API Base URL
const API_BASE_URL = 'https://u50yoy2qad.execute-api.us-east-1.amazonaws.com/prod';

// State
let allDeals = [];
let filteredDeals = [];
let cart = [];
let appliedVoucher = null;

// Toast notification function
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadDeals();
    setupEventListeners();
    loadCartFromStorage();
    checkAuthState();
    initThemeToggle();
});

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // Toggle on click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterAndDisplayDeals();
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', () => {
        filterAndDisplayDeals();
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', () => {
        filterAndDisplayDeals();
    });
    
    // Cart button
    document.getElementById('cartBtn').addEventListener('click', () => {
        openCart();
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });
    
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// Load deals from API
async function loadDeals() {
    const dealsGrid = document.getElementById('dealsGrid');
    dealsGrid.innerHTML = '<div class="loading">Loading deals...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/deals`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch deals');
        }
        
        const data = await response.json();
        allDeals = data.deals || [];
        filteredDeals = [...allDeals];
        
        filterAndDisplayDeals();
    } catch (error) {
        console.error('Error loading deals:', error);
        dealsGrid.innerHTML = '<div class="error">Failed to load deals. Please try again later.</div>';
    }
}

// Filter and display deals
function filterAndDisplayDeals() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortSelect').value;
    
    // Filter
    filteredDeals = allDeals.filter(deal => {
        const matchesSearch = deal.title.toLowerCase().includes(searchTerm) || 
                             deal.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || deal.category === category;
        return matchesSearch && matchesCategory;
    });
    
    // Sort
    sortDeals(filteredDeals, sortBy);
    
    // Display
    displayDeals(filteredDeals);
}

// Sort deals
function sortDeals(deals, sortBy) {
    switch (sortBy) {
        case 'newest':
            deals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'discount':
            deals.sort((a, b) => b.discountPercent - a.discountPercent);
            break;
        case 'price-low':
            deals.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            deals.sort((a, b) => b.price - a.price);
            break;
        case 'expiring':
            deals.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
            break;
    }
}

// Display deals in grid
function displayDeals(deals) {
    const dealsGrid = document.getElementById('dealsGrid');
    
    if (deals.length === 0) {
        dealsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No deals found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    dealsGrid.innerHTML = deals.map(deal => createDealCard(deal)).join('');
    
    // Add click listeners to deal cards
    document.querySelectorAll('.deal-card').forEach(card => {
        card.addEventListener('click', () => {
            const dealId = card.dataset.dealId;
            const deal = allDeals.find(d => d.dealId === dealId);
            if (deal) {
                openDealModal(deal);
            }
        });
    });
}

// Create deal card HTML
function createDealCard(deal) {
    const isExpired = new Date(deal.expiresAt) < new Date();
    const isSoldOut = deal.quantity === 0;
    const isDisabled = isExpired || isSoldOut;
    const isLowStock = deal.quantity > 0 && deal.quantity <= 5;
    const daysUntilExpiry = Math.ceil((new Date(deal.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    
    return `
        <div class="deal-card ${isDisabled ? 'disabled' : ''}" data-deal-id="${deal.dealId}" data-disabled="${isDisabled}">
            <img src="${deal.imageUrl}" alt="${deal.title}" class="deal-image">
            <div class="deal-content">
                <span class="deal-category">${deal.category}</span>
                <h3 class="deal-title">${deal.title}</h3>
                <p class="deal-description">${deal.description}</p>
                
                <div class="deal-pricing">
                    <span class="deal-price">$${deal.price}</span>
                    <span class="deal-original-price">$${deal.originalPrice}</span>
                    <span class="deal-discount">${deal.discountPercent}% OFF</span>
                </div>
                
                <div class="deal-meta">
                    <span class="deal-stock ${isLowStock ? 'low' : ''} ${isSoldOut ? 'out' : ''}">
                        ${isSoldOut ? '<span class="soldout-tag">SOLD OUT</span>' : 
                          isLowStock ? `Only ${deal.quantity} left!` : 
                          `${deal.quantity} available`}
                    </span>
                    <span class="deal-expires ${isExpiringSoon ? 'expiring-soon' : ''}">
                        ${isExpired ? '<span class="expired-tag">EXPIRED</span>' : 
                          isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : 
                          `Expires ${new Date(deal.expiresAt).toLocaleDateString()}`}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Open deal modal
function openDealModal(deal) {
    const isExpired = new Date(deal.expiresAt) < new Date();
    const isSoldOut = deal.quantity === 0;
    const canPurchase = !isExpired && !isSoldOut;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <img src="${deal.imageUrl}" alt="${deal.title}" class="modal-deal-image">
        <span class="deal-category">${deal.category}</span>
        <h2 class="deal-title">${deal.title}</h2>
        <p class="deal-description">${deal.description}</p>
        
        <div class="modal-deal-pricing">
            <span class="deal-price">$${deal.price}</span>
            <span class="deal-original-price">$${deal.originalPrice}</span>
            <span class="deal-discount">${deal.discountPercent}% OFF</span>
        </div>
        
        <div class="deal-meta">
            <span>Available: ${deal.quantity}</span>
            <span>Expires: ${new Date(deal.expiresAt).toLocaleDateString()}</span>
        </div>
        
        ${canPurchase ? `
            <div class="quantity-selector">
                <button onclick="changeQuantity(-1, ${deal.quantity})">−</button>
                <input 
                    type="number" 
                    id="quantityInput" 
                    value="1" 
                    min="1" 
                    max="${deal.quantity > 10 ? 10 : deal.quantity}" 
                    onchange="validateQuantity(${deal.quantity})"
                    oninput="validateQuantity(${deal.quantity})"
                >
                <button onclick="changeQuantity(1, ${deal.quantity})">+</button>
            </div>
            <div id="quantityWarning" style="color: #e53e3e; font-size: 0.875rem; margin-top: 0.5rem; display: none;"></div>
            <button id="addToCartBtn" class="btn btn-primary" style="width: 100%;" onclick="addToCart('${deal.dealId}')">
                Add to Cart
            </button>
        ` : `
            <p style="color: #e53e3e; font-weight: 600; text-align: center; padding: 1rem;">
                ${isSoldOut ? 'This deal is sold out' : 'This deal has expired'}
            </p>
        `}
    `;
    
    openModal('dealModal');
}

// Change quantity in modal
function changeQuantity(delta, maxStock) {
    const input = document.getElementById('quantityInput');
    const max = Math.min(maxStock, 10);
    let currentValue = parseInt(input.value);
    
    // If current value is invalid or too high, normalize first
    if (isNaN(currentValue) || currentValue < 1) {
        // Invalid - set to 1
        currentValue = 1;
    } else if (currentValue > max) {
        // Over max - don't allow increasing, only decreasing to max
        if (delta > 0) {
            // Trying to increase when already over max - do nothing
            validateQuantity(maxStock);
            return;
        } else {
            // Decreasing - set to max first
            currentValue = max;
        }
    } else {
        // Valid current value - apply delta normally
        const newValue = currentValue + delta;
        
        // Check if new value is within range
        if (newValue >= 1 && newValue <= max) {
            currentValue = newValue;
        } else {
            // Out of range - keep current
            validateQuantity(maxStock);
            return;
        }
    }
    
    input.value = currentValue;
    
    // Always validate after button click to update button state
    validateQuantity(maxStock);
}

// Validate quantity for manual input
function validateQuantity(maxStock) {
    const input = document.getElementById('quantityInput');
    const warning = document.getElementById('quantityWarning');
    const addButton = document.getElementById('addToCartBtn');
    const maxAllowed = Math.min(maxStock, 10); // Cap at 10 per purchase
    let value = parseInt(input.value);
    
    // Handle invalid input (empty, negative, zero, or NaN)
    if (isNaN(value) || value < 1) {
        warning.textContent = 'Please enter a valid quantity (minimum 1)';
        warning.style.display = 'block';
        addButton.disabled = true;
        addButton.style.opacity = '0.5';
        addButton.style.cursor = 'not-allowed';
        return;
    }
    
    // Check if exceeds available stock
    if (value > maxStock) {
        warning.textContent = `Only ${maxStock} available. Please adjust quantity.`;
        warning.style.display = 'block';
        addButton.disabled = true;
        addButton.style.opacity = '0.5';
        addButton.style.cursor = 'not-allowed';
        return;
    }
    
    // Check if exceeds max per purchase (10)
    if (value > 10) {
        warning.textContent = `Maximum 10 per purchase. Please adjust quantity.`;
        warning.style.display = 'block';
        addButton.disabled = true;
        addButton.style.opacity = '0.5';
        addButton.style.cursor = 'not-allowed';
        return;
    }
    
    // Valid quantity - enable button and clear warning
    warning.style.display = 'none';
    addButton.disabled = false;
    addButton.style.opacity = '1';
    addButton.style.cursor = 'pointer';
}

// Add to cart
function addToCart(dealId) {
    const deal = allDeals.find(d => d.dealId === dealId);
    const quantity = parseInt(document.getElementById('quantityInput').value);
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.dealId === dealId);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentCartQuantity + quantity;
    
    // Validate against available stock
    if (totalQuantity > deal.quantity) {
        showToast(`Only ${deal.quantity} available. You have ${currentCartQuantity} in cart already.`, 'error');
        return;
    }
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            dealId: deal.dealId,
            title: deal.title,
            price: deal.price,
            imageUrl: deal.imageUrl,
            quantity: quantity,
            maxQuantity: deal.quantity
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    closeModal(document.getElementById('dealModal'));
    
    // Show success toast
    showToast(`Added ${quantity} × ${deal.title} to cart!`, 'success');
}

// Open cart modal
async function openCart() {
    if (cart.length === 0) {
        const cartBody = document.getElementById('cartBody');
        cartBody.innerHTML = `
            <div class="cart-empty">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some amazing deals to get started!</p>
            </div>
        `;
        openModal('cartModal');
        return;
    }
    
    // Validate cart items against current stock
    await validateCartItems();
    
    displayCart();
    openModal('cartModal');
}

// Validate cart items against current deals
async function validateCartItems() {
    const now = new Date();
    const warnings = [];
    
    for (let i = cart.length - 1; i >= 0; i--) {
        const cartItem = cart[i];
        const currentDeal = allDeals.find(d => d.dealId === cartItem.dealId);
        
        if (!currentDeal) {
            warnings.push(`${cartItem.title} is no longer available and was removed from cart`);
            cart.splice(i, 1);
            continue;
        }
        
        const isExpired = new Date(currentDeal.expiresAt) < now;
        const isSoldOut = currentDeal.quantity === 0;
        
        if (isExpired) {
            warnings.push(`${cartItem.title} has expired and was removed from cart`);
            cart.splice(i, 1);
        } else if (isSoldOut) {
            warnings.push(`${cartItem.title} is sold out and was removed from cart`);
            cart.splice(i, 1);
        } else if (cartItem.quantity > currentDeal.quantity) {
            // Adjust quantity to available stock
            const oldQuantity = cartItem.quantity;
            cartItem.quantity = currentDeal.quantity;
            warnings.push(`${cartItem.title}: Only ${currentDeal.quantity} available (reduced from ${oldQuantity})`);
        }
    }
    
    if (warnings.length > 0) {
        updateCartCount();
        saveCartToStorage();
        warnings.forEach(warning => showToast(warning, 'error'));
    }
}

// Display cart
function displayCart() {
    const cartBody = document.getElementById('cartBody');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartBody.innerHTML = `
        <div class="cart-items">
            ${cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="cart-summary-row total">
                <span>Total:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
        </div>
        
        <button class="btn btn-success" style="width: 100%;" onclick="proceedToCheckout()">
            Proceed to Checkout
        </button>
    `;
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    saveCartToStorage();
    
    if (cart.length === 0) {
        closeModal(document.getElementById('cartModal'));
    } else {
        displayCart();
    }
}

// Proceed to checkout
function proceedToCheckout() {
    // Navigate to checkout page
    window.location.href = 'checkout.html';
}

// Open checkout modal
function openCheckoutModal() {
    const checkoutBody = document.getElementById('checkoutBody');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedVoucher ? (subtotal * appliedVoucher.discountPercent / 100) : 0;
    const total = subtotal - discount;
    
    checkoutBody.innerHTML = `
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${appliedVoucher ? `
                <div class="cart-summary-row" style="color: #48bb78;">
                    <span>Discount (${appliedVoucher.code}):</span>
                    <span>-$${discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="cart-summary-row total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="voucher-section">
            <h3>Have a voucher code?</h3>
            <div class="voucher-input-group">
                <input type="text" id="voucherInput" placeholder="Enter code" ${appliedVoucher ? 'disabled' : ''}>
                <button class="btn btn-secondary" onclick="applyVoucher()" ${appliedVoucher ? 'disabled' : ''}>
                    Apply
                </button>
            </div>
            <div id="voucherMessage"></div>
        </div>
        
        <form class="checkout-form" onsubmit="submitOrder(event)">
            <div class="form-group">
                <label for="customerName">Full Name *</label>
                <input type="text" id="customerName" required>
            </div>
            
            <div class="form-group">
                <label for="customerEmail">Email *</label>
                <input type="email" id="customerEmail" required>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                Complete Purchase
            </button>
        </form>
    `;
    
    openModal('checkoutModal');
}

// Apply voucher
async function applyVoucher() {
    const voucherCode = document.getElementById('voucherInput').value.trim();
    const messageDiv = document.getElementById('voucherMessage');
    
    if (!voucherCode) {
        messageDiv.innerHTML = '<div class="voucher-message error">Please enter a voucher code</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voucherCode })
        });
        
        const data = await response.json();
        
        if (data.valid) {
            appliedVoucher = {
                code: voucherCode,
                discountPercent: data.voucher.discountPercent
            };
            messageDiv.innerHTML = `<div class="voucher-message success">Voucher applied! ${data.voucher.discountPercent}% off</div>`;
            // Refresh checkout display
            setTimeout(() => openCheckoutModal(), 1000);
        } else {
            messageDiv.innerHTML = `<div class="voucher-message error">${data.error || 'Invalid voucher code'}</div>`;
        }
    } catch (error) {
        console.error('Error validating voucher:', error);
        messageDiv.innerHTML = '<div class="voucher-message error">Failed to validate voucher</div>';
    }
}

// Submit order
async function submitOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    
    const orderData = {
        items: cart.map(item => ({
            dealId: item.dealId,
            quantity: item.quantity
        })),
        customerName,
        customerEmail,
        voucherCode: appliedVoucher ? appliedVoucher.code : null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showOrderConfirmation(data.order);
            cart = [];
            appliedVoucher = null;
            updateCartCount();
            saveCartToStorage();
        } else {
            alert(`Order failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
    }
}

// Show order confirmation
function showOrderConfirmation(order) {
    closeModal(document.getElementById('checkoutModal'));
    
    const checkoutBody = document.getElementById('checkoutBody');
    checkoutBody.innerHTML = `
        <div class="order-confirmation">
            <div class="success-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase, ${order.customerName}!</p>
            
            <div class="order-details">
                <div class="order-details-row">
                    <strong>Order ID:</strong>
                    <span>${order.orderId}</span>
                </div>
                <div class="order-details-row">
                    <strong>Email:</strong>
                    <span>${order.customerEmail}</span>
                </div>
                <div class="order-details-row">
                    <strong>Total Amount:</strong>
                    <span>$${order.totalAmount.toFixed(2)}</span>
                </div>
                ${order.discount > 0 ? `
                    <div class="order-details-row" style="color: #48bb78;">
                        <strong>Discount:</strong>
                        <span>-$${order.discount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="order-details-row">
                    <strong>Final Amount:</strong>
                    <span style="font-size: 1.25rem; color: #667eea;">$${order.finalAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <p style="margin-top: 1.5rem; color: #718096;">
                A confirmation email has been sent to ${order.customerEmail}
            </p>
            
            <button class="btn btn-primary" onclick="closeAllModals(); loadDeals();" style="margin-top: 1rem;">
                Continue Shopping
            </button>
        </div>
    `;
    
    openModal('checkoutModal');
}

// Modal helpers
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Cart helpers
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Authentication UI
async function checkAuthState() {
    try {
        const isAuth = await auth.isAuthenticated();
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (isAuth) {
            // User is logged in - show user menu
            authButtons.style.display = 'none';
            userMenu.style.display = 'inline-block';
            
            // Get user info and display name
            try {
                const userInfo = await auth.getCurrentUser();
                const userName = userInfo.name || userInfo.email.split('@')[0];
                document.getElementById('userName').textContent = userName;
            } catch (err) {
                console.error('Error getting user info:', err);
            }
        } else {
            // User is logged out - show auth buttons
            authButtons.style.display = 'inline-block';
            userMenu.style.display = 'none';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // Default to showing auth buttons on error
        document.getElementById('authButtons').style.display = 'inline-block';
        document.getElementById('userMenu').style.display = 'none';
    }
}

// Setup auth event listeners
document.addEventListener('DOMContentLoaded', () => {
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }
});

