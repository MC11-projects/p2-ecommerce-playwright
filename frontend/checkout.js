// Configuration - API Base URL
const API_BASE_URL = 'https://u50yoy2qad.execute-api.us-east-1.amazonaws.com/prod';

// State
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

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const isAuth = await auth.isAuthenticated();
        
        if (!isAuth) {
            // Redirect to login with return URL
            window.location.href = `login.html?redirect=checkout.html`;
            return;
        }
        
        // User is authenticated - proceed with checkout
        loadCartFromStorage();
        displayOrderSummary();
        setupEventListeners();
        prefillUserInfo();
        
    } catch (error) {
        console.error('Auth check error:', error);
        // Redirect to login on error
        window.location.href = `login.html?redirect=checkout.html`;
    }
}

// Pre-fill user info from Cognito
async function prefillUserInfo() {
    try {
        const userInfo = await auth.getCurrentUser();
        
        if (userInfo.name) {
            document.getElementById('customerName').value = userInfo.name;
        }
        
        if (userInfo.email) {
            document.getElementById('customerEmail').value = userInfo.email;
            document.getElementById('customerEmail').readOnly = true; // Don't allow changing email
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        // Non-fatal error - user can still fill in manually
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('applyVoucherBtn').addEventListener('click', applyVoucher);
    document.getElementById('checkoutForm').addEventListener('submit', submitOrder);
    
    // Card number formatting (add spaces every 4 digits)
    document.getElementById('cardNumber').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, ''); // Remove spaces
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value; // Add spaces
        e.target.value = formatted;
    });
    
    // Expiry date formatting (MM/YY)
    document.getElementById('cardExpiry').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    // CVV - only allow digits
    document.getElementById('cardCVV').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// Load cart from storage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    // Redirect if cart is empty
    if (cart.length === 0) {
        window.location.href = 'index.html';
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedVoucher ? (subtotal * appliedVoucher.discountPercent / 100) : 0;
    const total = subtotal - discount;
    
    // Display items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.imageUrl}" alt="${item.title}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-title">${item.title}</div>
                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Update totals
    document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    
    // Show/hide discount row
    if (appliedVoucher) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discountAmount').textContent = `-$${discount.toFixed(2)}`;
        
        // Disable voucher input
        document.getElementById('voucherInput').disabled = true;
        document.getElementById('applyVoucherBtn').disabled = true;
    }
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
                'Content-Type': 'application/json',
                'Authorization': auth.getIdToken()
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
            displayOrderSummary(); // Refresh display
            showToast('Voucher applied successfully!', 'success');
        } else {
            messageDiv.innerHTML = `<div class="voucher-message error">${data.error || 'Invalid voucher code'}</div>`;
            showToast(data.error || 'Invalid voucher code', 'error');
        }
    } catch (error) {
        console.error('Error validating voucher:', error);
        messageDiv.innerHTML = '<div class="voucher-message error">Failed to validate voucher</div>';
        showToast('Failed to validate voucher', 'error');
    }
}

// Submit order
async function submitOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerCity = document.getElementById('customerCity').value;
    const customerState = document.getElementById('customerState').value;
    const customerZip = document.getElementById('customerZip').value;
    
    // Get and validate card details
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    
    // Validate card number (16 digits)
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        showToast('Invalid card number. Must be 16 digits.', 'error');
        return;
    }
    
    // Validate expiry date format and future date
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
        showToast('Invalid expiry date. Use MM/YY format.', 'error');
        return;
    }
    
    const [month, year] = cardExpiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    today.setDate(1); // Compare from start of current month
    
    if (expiryDate < today) {
        showToast('Card has expired.', 'error');
        return;
    }
    
    // Validate CVV (3 digits)
    if (cardCVV.length !== 3 || !/^\d+$/.test(cardCVV)) {
        showToast('Invalid CVV. Must be 3 digits.', 'error');
        return;
    }
    
    const orderData = {
        items: cart.map(item => ({
            dealId: item.dealId,
            quantity: item.quantity
        })),
        customerName,
        customerEmail,
        shippingAddress: {
            address: customerAddress,
            city: customerCity,
            state: customerState,
            zip: customerZip
        },
        voucherCode: appliedVoucher ? appliedVoucher.code : null
    };
    
    // Disable form while submitting
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth.getIdToken()
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save order to localStorage for confirmation page
            localStorage.setItem('lastOrder', JSON.stringify(data.order));
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        } else {
            showToast(data.error || 'Order failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Purchase';
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showToast('Failed to create order. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Purchase';
    }
}
