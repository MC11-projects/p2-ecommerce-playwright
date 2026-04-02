export class CheckoutPage {
    constructor(page) {
       this.page = page
       this.checkoutHeaderHomeButton = page.locator('.header-content')
       this.checkoutPageTitle = page.locator('.checkout-page')
       this.checkoutOrderSummary = page.locator('.order-summary-section')
       this.checkoutItemTitle = page.locator('.order-item-title')
       this.checkoutItemQty = page.locator('.order-item-quantity')
       this.checkoutItemPrice = page.locator('.order-item-price')
       this.checkoutItemRemoveButton = page.locator('.remove-btn')
       this.checkoutSummarySubtotal = page.locator('.cart-summary-row', {hasText: 'Subtotal'})
       this.checkoutSummaryTotal = page.locator('.cart-summary-row.total')
       this.checkoutFormSectionTitle = page.locator('.checkout-form-section')
       this.checkoutVoucherSectionTitle = page.locator('.voucher-section')
       this.checkoutVoucherInput = page.locator('#voucherInput')
       this.checkoutVoucherApplyButton = page.locator('#applyVoucherBtn')
       this.checkoutFormCustomerName = page.locator('#customerName')
       this.checkoutFormCustomerEmail = page.locator('#customerEmail')
       this.checkoutFormCustomerAddress = page.locator('#customerAddress')   
       this.checkoutFormCustomerCity = page.locator('#customerCity')  
       this.checkoutFormCustomerState = page.locator('#customerState')
       this.checkoutFormCustomerZip = page.locator('#customerZip')
       this.checkoutFormCardNumber = page.locator('#cardNumber')
       this.checkoutFormCardName = page.locator('#cardName')    
       this.checkoutFormCardExpiryDate = page.locator('#cardExpiry')     
       this.checkoutFormCardCVV = page.locator('#cardCVV')
       this.checkoutBackButton = page.locator('.btn.btn-secondary')   
       this.checkoutCompletePurchaseButton = page.locator('.btn.btn-primary')
    }

     async goto() {
        await this.page.goto('/checkout.html')
    }
    
    async fillCustomerInfo(name, email) {
        await this.checkoutFormCustomerName.fill(name)
        await this.checkoutFormCustomerEmail.fill(email)
    }
    
    async fillShippingAddress(address, city, state, zip) {
        await this.checkoutFormCustomerAddress.fill(address)
        await this.checkoutFormCustomerCity.fill(city)
        await this.checkoutFormCustomerState.fill(state)
        await this.checkoutFormCustomerZip.fill(zip)
    }
    
    async fillPaymentInfo(cardNumber, cardName, expiry, cvv) {
        await this.checkoutFormCardNumber.fill(cardNumber)
        await this.checkoutFormCardName.fill(cardName)
        await this.checkoutFormCardExpiryDate.fill(expiry)
        await this.checkoutFormCardCVV.fill(cvv)
    }
    
    async applyVoucher(code) {
        await this.checkoutVoucherInput.fill(code)
        await this.checkoutVoucherApplyButton.click()
    }
    
    async completePurchase() {
        await this.checkoutCompletePurchaseButton.click()
    }
    
    async goBack() {
        await this.checkoutBackButton.click()
    }
    
    async removeItem(index) {
        await this.checkoutItemRemoveButton.nth(index).click()
    }
}