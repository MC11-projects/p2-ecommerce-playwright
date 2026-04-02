export class CartModal {
    constructor(page) {
        this.page = page
        this.cartModalClosed = page.locator('#cartModal')
        this.addToCartButton = page.locator('#addToCartBtn')
        this.quantityInput = page.locator('#quantityInput')
        this.cartHeaderButton = page.locator('#cartBtn')
        this.cartHeaderCount = page.locator('#cartCount')
        this.cartModalEmpty = page.locator('.cart-empty')
        this.cartTitle = page.locator('#cartTitle')
        this.cartItemImage = page.locator('.cart-item-image')
        this.cartItemTitle = page.locator('.cart-item-title')
        this.cartItemPrice = page.locator('.cart-item-price')
        this.cartItemRemoveDeal = page.locator('.remove-btn')
        this.cartSummarySubtotal = page.locator('.cart-summary-row', {hasText: 'Subtotal'})
        this.cartSummaryTotal = page.locator('.cart-summary-row.total')
        this.cartClose = page.getByRole('button', {name: 'Close Cart'})
        this.cartProceedToCheckout = page.locator('.btn.btn-success')
        this.cartQuantityMinus = page.locator('.quantity-btn').first()
        this.cartQuantityPlus = page.locator('.quantity-btn').last()
        this.cartQuantityDisplay = page.locator('.cart-quantity-display')
                
    }
    
    async clickCart() {
        await this.cartHeaderButton.click()
    }

    async clickCloseCart() {
        await this.cartClose.click()
    }

    async increaseQuantityInCart() {
        await this.cartQuantityPlus.click()
    }

    async decreaseQuantityInCart() {
        await this.cartQuantityMinus.click()
    }

    async removeDealFromCart() {
        await this.cartItemRemoveDeal.click()
    }
}