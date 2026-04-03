import { test, expect } from '@playwright/test'
import { CartModal } from './pages/CartModal'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { navigateToCheckout } from './helpers/checkoutHelper'

test.describe('Checkout', () => {
    let checkoutPage
    let cartModal
    let homePage

    test.beforeEach(async ({page}) => {
        checkoutPage = new CheckoutPage(page)
    })

    test('Complete checkout happy path', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        await expect(page.locator('.confirmation-content')).toContainText('Order Confirmed!')
        
    })

    test('Required field validation', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        await checkoutPage.completePurchase()
        await checkoutPage.verifyAllRequiredFieldErrors()
    })

    test('Invalid email validation', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('John Smith', 'notanemail')
        await checkoutPage.completePurchase()
        
        await checkoutPage.verifyFieldError('customerEmail', 'Please enter a valid email address.')
    })

    test('Invalid card number validation', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('rurgu33fvhe24rfg', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        
        await checkoutPage.verifyFieldError('cardNumber', 'Invalid card number. Must be 16 digits.')
    })

    test('Expired card usage', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/25', '123')
        await checkoutPage.completePurchase()

        await checkoutPage.verifyFieldError('cardExpiry', 'Card has expired.')
    })

    test('Invalid CVV', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/27', '11112')
        await checkoutPage.completePurchase()

        await checkoutPage.verifyFieldError('cardCVV', 'Invalid CVV. Must be 3 digits.')
    })

    test('Applying valid voucher code', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.applyVoucher('WELCOME10')
        await expect(checkoutPage.checkoutVoucherMessage).toContainText('Voucher applied! 10% off')
        await expect(checkoutPage.checkoutDiscount).toContainText('Discount')
        await expect(checkoutPage.checkoutDiscountAmount).toContainText('-$3.50')
        await checkoutPage.completePurchase()
        await expect(page.locator('.confirmation-content')).toContainText('Order Confirmed!')
    })

    test('Applying expired voucher code', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.applyVoucher('EXPIRED')
        await expect(checkoutPage.checkoutVoucherMessage).toContainText('Voucher has expired')
        await expect(checkoutPage.checkoutDiscount).toBeHidden()
    })

    test('Applying used voucher code', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()

        await checkoutPage.applyVoucher('USED123')
        await expect(checkoutPage.checkoutVoucherMessage).toContainText('Voucher has already been used')
        await expect(checkoutPage.checkoutDiscount).toBeHidden()
    })

     test('Remove voucher code', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()

        await checkoutPage.removeVoucher('WELCOME10')
        await expect(checkoutPage.checkoutDiscount).toBeHidden()
    })

    test('Cart persists after back button', async ({page}) => {
        cartModal = new CartModal(page)
        homePage = new HomePage(page)
        await navigateToCheckout(page)
        
        await expect(checkoutPage.checkoutItemTitle).toBeVisible()
        await checkoutPage.checkoutBackButton.click()
        await page.waitForLoadState('networkidle')
        await cartModal.clickCart()
        await cartModal.cartProceedToCheckout.click()
        await expect(checkoutPage.checkoutItemPrice).toBeVisible()
    })

    test('Remove item from checkout', async ({page}) => {
        await navigateToCheckout(page)
        
        await expect(checkoutPage.checkoutItemTitle).toBeVisible()
        await checkoutPage.checkoutItemRemoveButton.click()
        await expect(page.locator('#toastContainer .toast-message').filter({ hasText: 'removed from cart' })).toBeVisible()
        await expect(page.locator('#toastContainer .toast-message').filter({ hasText: 'Your cart is empty' })).toBeVisible()
        await expect(page).toHaveURL(/.*index.html/)
    })

    test('Negative balance check via voucher', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        
        await checkoutPage.applyVoucher('FREE100')
        await expect(checkoutPage.checkoutVoucherMessage).toContainText('Voucher applied! 100% off')
        await expect(checkoutPage.checkoutDiscountAmount).toContainText('-$35.00')
        await expect(checkoutPage.checkoutTotalAmount).toContainText('$0.00')
    })

    test('Voucher check upon deal removal from checkout', async ({page}) => {
        cartModal = new CartModal(page)
        homePage = new HomePage(page)

        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
        await checkoutPage.applyVoucher('WELCOME10')
        await page.waitForTimeout(1000)
        await checkoutPage.checkoutItemRemoveButton.click()
        await page.waitForLoadState('networkidle')
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        await cartModal.cartProceedToCheckout.click()
        await page.waitForTimeout(1000)
        await expect(checkoutPage.checkoutDiscount).not.toBeVisible()
    })
})