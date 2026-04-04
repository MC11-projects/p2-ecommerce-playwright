// Initialize confirmation page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetails();
});

// Load order details from localStorage
function loadOrderDetails() {
    const orderData = localStorage.getItem('lastOrder');
    
    if (!orderData) {
        // No order found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    const order = JSON.parse(orderData);
    
    // Display order details
    document.getElementById('thankYouMessage').textContent = `Thank you for your purchase, ${order.customerName}!`;
    document.getElementById('orderId').textContent = order.orderId;
    document.getElementById('customerEmail').textContent = order.customerEmail;
    document.getElementById('confirmationEmail').textContent = order.customerEmail;
    document.getElementById('orderDate').textContent = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Display order items
    const itemsList = document.getElementById('orderItemsList');
    itemsList.innerHTML = order.items.map(item => `
        <div class="order-details-row">
            <span>${item.quantity}× ${item.title}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    // Display totals
    document.getElementById('orderSubtotal').textContent = `$${order.totalAmount.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${order.finalAmount.toFixed(2)}`;
    
    // Show discount if applicable
    if (order.discount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('orderDiscount').textContent = `-$${order.discount.toFixed(2)}`;
    }
    
    // Clear the order from storage after displaying (prevents refreshing to see same order)
    localStorage.removeItem('lastOrder');
}
