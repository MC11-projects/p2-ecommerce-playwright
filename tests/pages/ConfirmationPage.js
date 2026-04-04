import { expect } from '@playwright/test'

export class ConfirmationPage {
    constructor(page) {
        this.page = page
        this.orderConfirmationHeading = page.locator('.confirmation-content')
        this.orderConfirmationMessage = page.locator('#thankYouMessage')
        this.orderId = page.locator('#orderId')
        this.customerEmail = page.locator('#customerEmail')
        this.orderDate = page.locator('#orderDate')
        this.orderItemsList = page.locator('#orderItemsList')
        this.orderSubtotal = page.locator('#orderSubtotal')
        this.orderTotal = page.locator('#orderTotal')
        this.orderDiscountRow = page.locator('#discountRow')
        this.orderDiscountAmount = page.locator('#orderDiscount')
        this.confirmationEmailText = page.locator('.confirmation-page p').filter({ hasText: 'confirmation email' })
        this.continueShoppingButton = page.locator('.confirmation-actions')
    }

    async assertConfirmationPageInformation(expectedName, expectedEmail, expectedItemName) {
        await expect(this.orderConfirmationHeading).toContainText('Order Confirmed!')
        await expect(this.orderConfirmationMessage).toContainText(`Thank you for your purchase, ${expectedName}!`)
        await expect(this.orderId).not.toBeEmpty()
        await expect(this.customerEmail).toHaveText(expectedEmail)
        await expect(this.orderDate).toHaveText(/[A-Z][a-z]+ \d+, \d{4} at \d+:\d+ (AM|PM)/)
        await expect(this.orderItemsList).toContainText(expectedItemName)
        await expect(this.orderSubtotal).toHaveText(/\$\d+\.\d{2}/)
        await expect(this.orderTotal).toHaveText(/\$\d+\.\d{2}/)
        await expect(this.confirmationEmailText).toContainText(`A confirmation email has been sent to ${expectedEmail}`)
    }

     async assertDiscountApplied() {
        await expect(this.orderDiscountRow).toBeVisible()
        await expect(this.orderDiscountAmount).toHaveText(/-\$\d+\.\d{2}/)
    }

    async assertNoDiscount() {
        await expect(this.orderDiscountRow).not.toBeVisible()
    }

    async clickContinueShopping() {
        await this.continueShoppingButton.click()
    }

    async goto() {
        await this.page.goto('/confirmation.html')
    }
}