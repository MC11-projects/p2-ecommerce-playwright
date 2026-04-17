// Configuration
const API_BASE_URL = 'https://s8om49pim4.execute-api.us-east-1.amazonaws.com/prod';

// State
let allVouchers = [];
let filteredVouchers = [];
let selectedVoucher = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    setupEventListeners();
    await loadVouchers();
});

// Toast notification
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
    
    setTimeout(() => toast.remove(), 3000);
}

// Check authentication
async function checkAuthentication() {
    const isAuth = await auth.isAuthenticated();
    
    if (!isAuth) {
        window.location.href = 'login.html?redirect=order-history.html';
        return;
    }
    
    // Get user info and update header
    try {
        const userInfo = await auth.getCurrentUser();
        document.getElementById('userName').textContent = userInfo.name || 'User';
        document.getElementById('userMenu').style.display = 'block';
    } catch (error) {
        console.error('Error getting user info:', error);
        document.getElementById('userMenu').style.display = 'block';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // User menu
    document.getElementById('userMenuBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('userDropdown').classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.getElementById('userDropdown').classList.remove('active');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.signOut();
        window.location.href = 'index.html';
    });
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('expiryFilter').addEventListener('change', applyFilters);
    
    // Redeem modal
    document.getElementById('cancelRedeem').addEventListener('click', closeRedeemModal);
    document.getElementById('confirmRedeem').addEventListener('click', confirmRedeem);
    document.getElementById('closeRedeemModal').addEventListener('click', closeRedeemModal);
    
    // Gift modal
    document.getElementById('cancelGift').addEventListener('click', closeGiftModal);
    document.getElementById('confirmGift').addEventListener('click', confirmGift);
    document.getElementById('closeGiftModal').addEventListener('click', closeGiftModal);
    
    // Details modal
    document.getElementById('closeDetailsModal').addEventListener('click', closeDetailsModal);
    
    // Modal overlay clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Load vouchers from API
async function loadVouchers() {
    try {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('vouchersContainer').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
        
        // Fetch vouchers
        const vouchersResponse = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
                'Authorization': auth.getIdToken()
            }
        });
        
        if (!vouchersResponse.ok) {
            throw new Error('Failed to load vouchers');
        }
        
        const vouchersData = await vouchersResponse.json();
        
        // Fetch deals to get imageUrl
        const dealsResponse = await fetch(`${API_BASE_URL}/deals`);
        const dealsData = await dealsResponse.json();
        const deals = dealsData.deals || [];
        
        // Create a map of dealId -> deal for quick lookup
        const dealsMap = {};
        deals.forEach(deal => {
            dealsMap[deal.dealId] = deal;
        });
        
        // Flatten all vouchers from all orders
        allVouchers = [];
        vouchersData.orders.forEach(order => {
            order.vouchers.forEach(voucher => {
                // Store orderId with voucher for API calls
                voucher.orderId = order.orderId;
                
                // Enrich with imageUrl from deals
                const deal = dealsMap[voucher.dealId];
                if (deal) {
                    voucher.imageUrl = deal.imageUrl;
                }
                
                // Check if expired
                const now = new Date();
                const expiryDate = new Date(voucher.expiresAt);
                if (expiryDate < now && voucher.status === 'active') {
                    voucher.status = 'expired';
                }
                
                allVouchers.push(voucher);
            });
        });
        
        applyFilters();
        
    } catch (error) {
        console.error('Error loading vouchers:', error);
        showToast('Failed to load vouchers', 'error');
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
    }
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const expiryFilter = document.getElementById('expiryFilter').value;
    
    filteredVouchers = allVouchers.filter(voucher => {
        // Status filter
        if (statusFilter !== 'all' && voucher.status !== statusFilter) {
            return false;
        }
        
        // Expiry filter
        if (expiryFilter !== 'all') {
            const expiryDate = new Date(voucher.expiresAt);
            const now = new Date();
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (expiryFilter === 'expiring-soon' && diffDays > 7) {
                return false;
            }
            
            if (expiryFilter === 'this-month') {
                const thisMonth = now.getMonth();
                const expiryMonth = expiryDate.getMonth();
                if (thisMonth !== expiryMonth) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    displayVouchers();
}

// Display vouchers
function displayVouchers() {
    const container = document.getElementById('vouchersContainer');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    loadingState.style.display = 'none';
    
    if (filteredVouchers.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredVouchers.map(voucher => createVoucherCard(voucher)).join('');
}

// Create voucher card HTML
function createVoucherCard(voucher) {
    const expiryDate = new Date(voucher.expiresAt);
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const redeemedDate = voucher.redeemedAt ? new Date(voucher.redeemedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;
    
    // Determine which buttons to show
    const showRedeem = voucher.status === 'active';
    const showGift = voucher.status === 'active';
    const showRebuy = voucher.status === 'redeemed' || voucher.status === 'expired' || voucher.status === 'gifted';
    
    return `
        <div class="voucher-card ${voucher.status}">
            <div class="voucher-info">
                ${voucher.imageUrl ? `<img src="${voucher.imageUrl}" alt="${voucher.dealTitle}" class="voucher-image">` : ''}
                <div>
                    <div class="voucher-title">${voucher.dealTitle}</div>
                    <span class="voucher-status ${voucher.status}">${voucher.status}</span>
                </div>
                <div class="voucher-code">Code: ${voucher.voucherCode}</div>
                <div class="voucher-price">$${voucher.price.toFixed(2)}</div>
                <div class="voucher-meta">
                    <span class="voucher-meta-item">
                        📅 Expires: ${formattedExpiry}
                    </span>
                    ${voucher.status === 'redeemed' ? `
                        <span class="voucher-meta-item">
                            ✓ Redeemed: ${redeemedDate}
                        </span>
                    ` : ''}
                    ${voucher.status === 'gifted' ? `
                        <span class="voucher-meta-item">
                            🎁 Gifted to: ${voucher.giftedTo}
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <div class="voucher-actions">
                ${showRedeem ? `
                    <button class="btn-redeem" onclick="openRedeemModal('${voucher.voucherId}')">
                        Redeem
                    </button>
                ` : ''}
                ${showGift ? `
                    <button class="btn-gift" onclick="openGiftModal('${voucher.voucherId}')">
                        Gift
                    </button>
                ` : ''}
                <button class="btn-details" onclick="openDetailsModal('${voucher.voucherId}')">
                    View Details
                </button>
                ${showRebuy ? `
                    <button class="btn-rebuy" onclick="rebuyDeal('${voucher.dealId}')">
                        Re-buy
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Open redeem modal
function openRedeemModal(voucherId) {
    selectedVoucher = allVouchers.find(v => v.voucherId === voucherId);
    if (!selectedVoucher) return;
    
    document.getElementById('redeemModalContent').innerHTML = `
        ${selectedVoucher.imageUrl ? `<img src="${selectedVoucher.imageUrl}" alt="${selectedVoucher.dealTitle}" class="voucher-image" style="margin-bottom: 1rem;">` : ''}
        <p><strong>${selectedVoucher.dealTitle}</strong></p>
        <p>Code: <span class="voucher-code">${selectedVoucher.voucherCode}</span></p>
        <p>Value: <strong>$${selectedVoucher.price.toFixed(2)}</strong></p>
    `;
    
    document.getElementById('redeemModal').classList.add('active');
}

function closeRedeemModal() {
    document.getElementById('redeemModal').classList.remove('active');
    selectedVoucher = null;
}

// Confirm redeem
async function confirmRedeem() {
    if (!selectedVoucher) return;
    
    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/${selectedVoucher.orderId}/vouchers/${selectedVoucher.voucherId}/redeem`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': auth.getIdToken()
                }
            }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Voucher redeemed successfully!', 'success');
            closeRedeemModal();
            await loadVouchers(); // Reload to update status
        } else {
            showToast(data.error || 'Failed to redeem voucher', 'error');
        }
    } catch (error) {
        console.error('Error redeeming voucher:', error);
        showToast('Failed to redeem voucher', 'error');
    }
}

// Open gift modal
function openGiftModal(voucherId) {
    selectedVoucher = allVouchers.find(v => v.voucherId === voucherId);
    if (!selectedVoucher) return;
    
    document.getElementById('giftModalContent').innerHTML = `
        ${selectedVoucher.imageUrl ? `<img src="${selectedVoucher.imageUrl}" alt="${selectedVoucher.dealTitle}" class="voucher-image" style="margin-bottom: 1rem;">` : ''}
        <p><strong>${selectedVoucher.dealTitle}</strong></p>
        <p>Code: <span class="voucher-code">${selectedVoucher.voucherCode}</span></p>
        <p>Value: <strong>$${selectedVoucher.price.toFixed(2)}</strong></p>
    `;
    
    document.getElementById('recipientEmail').value = '';
    document.getElementById('recipientEmailError').style.display = 'none';
    document.getElementById('giftModal').classList.add('active');
}

function closeGiftModal() {
    document.getElementById('giftModal').classList.remove('active');
    selectedVoucher = null;
}

// Confirm gift
async function confirmGift() {
    if (!selectedVoucher) return;
    
    const recipientEmail = document.getElementById('recipientEmail').value.trim();
    const errorDiv = document.getElementById('recipientEmailError');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
        errorDiv.textContent = 'Please enter a valid email address';
        errorDiv.style.display = 'block';
        return;
    }
    
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/${selectedVoucher.orderId}/vouchers/${selectedVoucher.voucherId}/gift`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': auth.getIdToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipientEmail })
            }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`Voucher gifted to ${recipientEmail}!`, 'success');
            closeGiftModal();
            await loadVouchers(); // Reload to update status
        } else {
            showToast(data.error || 'Failed to gift voucher', 'error');
        }
    } catch (error) {
        console.error('Error gifting voucher:', error);
        showToast('Failed to gift voucher', 'error');
    }
}

// Open details modal
function openDetailsModal(voucherId) {
    const voucher = allVouchers.find(v => v.voucherId === voucherId);
    if (!voucher) return;
    
    const purchasedDate = new Date(voucher.purchasedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const expiryDate = new Date(voucher.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let detailsHTML = `
        ${voucher.imageUrl ? `<img src="${voucher.imageUrl}" alt="${voucher.dealTitle}" class="voucher-image" style="margin-bottom: 1.5rem;">` : ''}
        <div class="details-grid">
            <div class="details-row">
                <div class="details-label">Deal</div>
                <div class="details-value">${voucher.dealTitle}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Voucher Code</div>
                <div class="details-value"><span class="voucher-code">${voucher.voucherCode}</span></div>
            </div>
            <div class="details-row">
                <div class="details-label">Value</div>
                <div class="details-value">$${voucher.price.toFixed(2)}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Status</div>
                <div class="details-value"><span class="voucher-status ${voucher.status}">${voucher.status}</span></div>
            </div>
            <div class="details-row">
                <div class="details-label">Purchased</div>
                <div class="details-value">${purchasedDate}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Expires</div>
                <div class="details-value">${expiryDate}</div>
            </div>
    `;
    
    if (voucher.redeemedAt) {
        const redeemedDate = new Date(voucher.redeemedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        detailsHTML += `
            <div class="details-row">
                <div class="details-label">Redeemed</div>
                <div class="details-value">${redeemedDate}</div>
            </div>
        `;
    }
    
    if (voucher.giftedTo) {
        detailsHTML += `
            <div class="details-row">
                <div class="details-label">Gifted To</div>
                <div class="details-value">${voucher.giftedTo}</div>
            </div>
        `;
    }
    
    detailsHTML += '</div>';
    
    document.getElementById('detailsModalContent').innerHTML = detailsHTML;
    document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

function closeAllModals() {
    closeRedeemModal();
    closeGiftModal();
    closeDetailsModal();
}

// Re-buy deal
function rebuyDeal(dealId) {
    // Redirect to homepage with deal modal open
    window.location.href = `index.html?dealId=${dealId}`;
}
