export class HomePage {
    constructor(page) {
        this.page = page
        this.userMenuButton = page.locator('#userMenuBtn')
        this.logoutButton = page.locator('#logoutBtn')
        this.userMenu = page.locator('#userMenu')
        this.signInButton = page.getByText('Sign In')
        this.dealsGrid = page.locator('#dealsGrid')
        this.dealCards = page.locator('.deal-card')
        this.dealTitle = page.locator('.deal-title')
        this.dealImage = page.locator('.deal-image')
        this.dealPrice = page.locator('.deal-pricing')
        this.dealStock = page.locator('.deal-stock')
        this.dealCategory = page.locator('.deal-category')
        this.dealExpires = page.locator('.deal-expires')
        this.dealDiscount = page.locator('.deal-discount')
        this.dealLowStock = page.locator('.deal-stock low')
        this.disabledDeals = page.locator('[data-disabled="true"]')
        this.dealModal = page.locator('#dealModal')
        this.modalCloseButton = page.locator('#dealModal .modal-close')
        this.modalBody = page.locator('#modalBody')
        this.addToCartButton = page.locator('#addToCartBtn')
        this.quantityInput = page.locator('#quantityInput')
        this.quantityInputPlusButton = page.locator('.quantity-selector button').nth(1)
        this.quantityInputMinusButton = page.locator('.quantity-selector button').nth(0)
        this.cartHeaderButton = page.locator('#cartBtn')
        this.cartHeaderCount = page.locator('#cartCount')
        
    }
    
    async goto() {
        await this.page.goto('/')
    }
    
    async logout() {
        await this.userMenuButton.click()
        await this.logoutButton.click()
    }

    async clickDeal(index) {
        await this.dealCards.nth(index).click()
}

    async clickDealById(dealId) {
        await this.page.locator(`[data-deal-id="${dealId}"]`).click()
}

    async getDealById(dealId) {
        return this.page.locator(`[data-deal-id="${dealId}"]`)
}
}