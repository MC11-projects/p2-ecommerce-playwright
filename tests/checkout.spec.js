import { test, expect } from '@playwright/test'
import { CheckoutPage } from './pages/CheckoutPage'
import { navigateToCheckout } from './helpers/checkoutHelper'

test.describe('Checkout', () => {
    let checkoutPage

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
})