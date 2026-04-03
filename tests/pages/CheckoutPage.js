import { expect } from '@playwright/test'

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
       this.checkoutVoucherMessage = page.locator('#voucherMessage')
       this.checkoutRemoveVoucher = page.locator('#removeVoucherBtn')
       this.checkoutDiscount = page.locator('#discountRow')
       this.checkoutDiscountAmount = page.locator('#discountAmount')
       this.checkoutTotalAmount = page.locator('#totalAmount')
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
       this.checkoutBackButton = page.getByText('Back to Shopping')   
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

    async removeVoucher(code) {
        await this.checkoutVoucherInput.fill(code)
        await this.checkoutVoucherApplyButton.click()
        await this.checkoutRemoveVoucher.click()
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

    async verifyFieldError(fieldId, expectedMessage) {
        await expect(this.page.locator(`#${fieldId}Error`)).toContainText(expectedMessage)
}

    async verifyAllRequiredFieldErrors() {
        await this.verifyFieldError('customerName', 'Please enter a valid name (letters only).')
        await this.verifyFieldError('customerEmail', 'Please enter a valid email address.')
        await this.verifyFieldError('customerAddress', 'Please enter a valid address (5-200 characters).')
        await this.verifyFieldError('customerCity', 'Please enter a valid city name.')
        await this.verifyFieldError('customerState', 'Please enter a valid state/province.')
        await this.verifyFieldError('customerZip', 'Please enter a valid ZIP/postal code.')
        await this.verifyFieldError('cardNumber', 'Invalid card number. Must be 16 digits.')
        await this.verifyFieldError('cardName', 'Please enter a valid cardholder name.')
        await this.verifyFieldError('cardExpiry', 'Invalid expiry date. Use MM/YY format.')
        await this.verifyFieldError('cardCVV', 'Invalid CVV. Must be 3 digits.')
    }
}