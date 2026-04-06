// Configuration - API Base URL
const API_BASE_URL = 'https://s8om49pim4.execute-api.us-east-1.amazonaws.com/prod';

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

// Field validation helpers
function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}Error`);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearFieldError(fieldId) {
    const errorDiv = document.getElementById(`${fieldId}Error`);
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function clearAllFieldErrors() {
    const errorFields = ['customerName', 'customerEmail', 'customerAddress', 'customerCity', 
                        'customerState', 'customerZip', 'cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
    errorFields.forEach(field => clearFieldError(field));
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
        
        // Validate cart items before checkout
        await validateCartItems();
        
        // Check if cart is empty after validation
        if (cart.length === 0) {
            showToast('Your cart is empty', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        displayOrderSummary();
        setupEventListeners();
        
    } catch (error) {
        console.error('Auth check error:', error);
        // Redirect to login on error
        window.location.href = `login.html?redirect=checkout.html`;
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('applyVoucherBtn').addEventListener('click', applyVoucher);
    document.getElementById('removeVoucherBtn').addEventListener('click', removeVoucher);
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
    
    // Load applied voucher if exists
    const savedVoucher = localStorage.getItem('appliedVoucher');
    if (savedVoucher) {
        appliedVoucher = JSON.parse(savedVoucher);
        
        // Restore voucher UI state
        document.getElementById('voucherInput').value = appliedVoucher.code;
        document.getElementById('voucherMessage').innerHTML = `<div class="voucher-message success">Voucher applied! ${appliedVoucher.discountPercent}% off</div>`;
    }
    
    // Note: Don't redirect here - let validation handle empty cart
}

// Validate cart items against current deals
async function validateCartItems() {
    try {
        // Fetch current deals from API
        const response = await fetch(`${API_BASE_URL}/deals`);
        if (!response.ok) {
            throw new Error('Failed to fetch deals');
        }
        
        const data = await response.json();
        const currentDeals = data.deals || [];
        
        const now = new Date();
        const warnings = [];
        
        // Validate each cart item
        for (let i = cart.length - 1; i >= 0; i--) {
            const cartItem = cart[i];
            const currentDeal = currentDeals.find(d => d.dealId === cartItem.dealId);
            
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
        
        // Save updated cart and show warnings
        if (warnings.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cart));
            warnings.forEach(warning => showToast(warning, 'error'));
        }
        
    } catch (error) {
        console.error('Error validating cart:', error);
        showToast('Unable to validate cart items', 'error');
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedVoucher ? (subtotal * appliedVoucher.discountPercent / 100) : 0;
    const total = subtotal - discount;
    
    // Display items
    orderItems.innerHTML = cart.map((item, index) => `
        <div class="order-item">
            <img src="${item.imageUrl}" alt="${item.title}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-title">${item.title}</div>
                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCheckout(${index})" title="Remove item">✕</button>
        </div>
    `).join('');
    
    // Update totals
    document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    
    // Show/hide discount row
    if (appliedVoucher) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discountAmount').textContent = `-$${discount.toFixed(2)}`;
        
        // Disable voucher input and apply button, show remove button
        document.getElementById('voucherInput').disabled = true;
        document.getElementById('applyVoucherBtn').disabled = true;
        document.getElementById('removeVoucherBtn').style.display = 'inline-block';
    } else {
        document.getElementById('discountRow').style.display = 'none';
        
        // Enable voucher input and apply button, hide remove button
        document.getElementById('voucherInput').disabled = false;
        document.getElementById('applyVoucherBtn').disabled = false;
        document.getElementById('removeVoucherBtn').style.display = 'none';
    }
}

// Remove item from checkout
function removeFromCheckout(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    
    // Show toast
    showToast(`${removedItem.title} removed from cart`, 'info');
    
    // If cart is empty, redirect to home
    if (cart.length === 0) {
        // Clear both cart and voucher
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedVoucher');
        
        showToast('Your cart is empty. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        // Update localStorage with remaining items
        localStorage.setItem('cart', JSON.stringify(cart));
        // Re-display order summary
        displayOrderSummary();
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
            
            // Save voucher to localStorage for persistence
            localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));
            
            messageDiv.innerHTML = `<div class="voucher-message success">Voucher applied! ${data.voucher.discountPercent}% off</div>`;
            displayOrderSummary(); // Refresh display
        } else {
            messageDiv.innerHTML = `<div class="voucher-message error">${data.error || 'Invalid voucher code'}</div>`;
        }
    } catch (error) {
        console.error('Error validating voucher:', error);
        messageDiv.innerHTML = '<div class="voucher-message error">Failed to validate voucher</div>';
    }
}

// Remove voucher
function removeVoucher() {
    appliedVoucher = null;
    localStorage.removeItem('appliedVoucher');
    
    document.getElementById('voucherInput').value = '';
    document.getElementById('voucherInput').disabled = false;
    document.getElementById('applyVoucherBtn').disabled = false;
    document.getElementById('removeVoucherBtn').style.display = 'none';
    document.getElementById('voucherMessage').innerHTML = '';
    
    displayOrderSummary(); // Refresh to remove discount
}

// Submit order
async function submitOrder(event) {
    event.preventDefault();
    
    // Clear all previous errors
    clearAllFieldErrors();
    
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerCity = document.getElementById('customerCity').value.trim();
    const customerState = document.getElementById('customerState').value.trim();
    const customerZip = document.getElementById('customerZip').value.trim();
    
    let hasErrors = false;
    
    // Validate customer name (at least 2 characters, letters and spaces)
    if (customerName.length < 2 || !/^[a-zA-Z\s'-]+$/.test(customerName)) {
        showFieldError('customerName', 'Please enter a valid name (letters only).');
        hasErrors = true;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
        showFieldError('customerEmail', 'Please enter a valid email address.');
        hasErrors = true;
    }
    
    // Validate address (not empty, reasonable length)
    if (customerAddress.length < 5 || customerAddress.length > 200) {
        showFieldError('customerAddress', 'Please enter a valid address (5-200 characters).');
        hasErrors = true;
    }
    
    // Validate city (letters, spaces, hyphens only)
    if (customerCity.length < 2 || !/^[a-zA-Z\s'-]+$/.test(customerCity)) {
        showFieldError('customerCity', 'Please enter a valid city name.');
        hasErrors = true;
    }
    
    // Validate state (2-50 characters, letters and spaces)
    if (customerState.length < 2 || customerState.length > 50 || !/^[a-zA-Z\s'-]+$/.test(customerState)) {
        showFieldError('customerState', 'Please enter a valid state/province.');
        hasErrors = true;
    }
    
    // Validate ZIP/postal code (alphanumeric, 3-10 characters for international support)
    if (customerZip.length < 3 || customerZip.length > 10 || !/^[a-zA-Z0-9\s-]+$/.test(customerZip)) {
        showFieldError('customerZip', 'Please enter a valid ZIP/postal code.');
        hasErrors = true;
    } else {
        // Ensure ZIP has at least 3 digits
        const digitCount = (customerZip.match(/\d/g) || []).length;
        if (digitCount < 3) {
            showFieldError('customerZip', 'ZIP/postal code must contain at least 3 digits.');
            hasErrors = true;
        }
    }
    
    // Get and validate card details
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();
    
    // Validate cardholder name (at least 2 characters, letters and spaces)
    if (cardName.length < 2 || !/^[a-zA-Z\s'-]+$/.test(cardName)) {
        showFieldError('cardName', 'Please enter a valid cardholder name.');
        hasErrors = true;
    }
    
    // Validate card number (16 digits)
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        showFieldError('cardNumber', 'Invalid card number. Must be 16 digits.');
        hasErrors = true;
    }
    
    // Validate expiry date format and future date
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
        showFieldError('cardExpiry', 'Invalid expiry date. Use MM/YY format.');
        hasErrors = true;
    } else {
        const [month, year] = cardExpiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        today.setDate(1); // Compare from start of current month
        
        if (expiryDate < today) {
            showFieldError('cardExpiry', 'Card has expired.');
            hasErrors = true;
        }
    }
    
    // Validate CVV (3 digits)
    if (cardCVV.length !== 3 || !/^\d+$/.test(cardCVV)) {
        showFieldError('cardCVV', 'Invalid CVV. Must be 3 digits.');
        hasErrors = true;
    }
    
    // Stop if there are validation errors
    if (hasErrors) {
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
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Handle expired/invalid token (API Gateway returns 403 for invalid tokens)
        if (response.status === 401 || response.status === 403) {
            console.log('🔴 AUTH ERROR HANDLER TRIGGERED:', response.status);
            
            // Sign out user completely (clears localStorage + Cognito session)
            auth.signOut();
            
            // Show user-friendly message
            showToast('Your session has expired. Please log in again.', 'error');
            
            // Redirect after short delay so user can see the message
            setTimeout(() => {
                window.location.href = `login.html?redirect=checkout.html&reason=expired`;
            }, 2000);
            
            // Stop execution
            return;
        }
        
        if (response.ok) {
            // Save order to localStorage for confirmation page
            localStorage.setItem('lastOrder', JSON.stringify(data.order));
            
            // Clear cart and voucher
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedVoucher');
            
            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        } else {
            console.log('🟡 OTHER ERROR HANDLER:', response.status);
            showToast(data.error || 'Order failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Purchase';
        }
    } catch (error) {
        console.error('🔴 CATCH BLOCK ERROR:', error);
        showToast('Failed to create order. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Purchase';
    }
}
