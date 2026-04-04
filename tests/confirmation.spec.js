import { test, expect } from '@playwright/test'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { navigateToCheckout } from './helpers/checkoutHelper'

test.describe('Confirmation Page', () => {
    let confirmationPage
    let checkoutPage

    test.beforeEach(async ({page}) => {
        confirmationPage = new ConfirmationPage(page)
        checkoutPage = new CheckoutPage(page)
    })

    test('Confirmation Page happy path @ui @confirmation @smoke @e2e', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
                    
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        await confirmationPage.assertNoDiscount()
        await confirmationPage.assertConfirmationPageInformation(
            'test user',
            'test1@example.com',
            'Adventure Park'
        )
    })

    test('Direct navigation without order redirects to homepage @confirmation @ui', async ({page}) => {
        await page.goto(process.env.BASE_URL)
        await page.evaluate(() => localStorage.removeItem('lastOrder'))
        await confirmationPage.goto()
        await expect(page).toHaveURL(/index.html/)
    })

    test('Confirmation Page continue shopping button validation @ui @confirmation', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
                    
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        await confirmationPage.clickContinueShopping()
        await expect(page).toHaveURL(/index.html/)
    })

    test('Confirmation Page with voucher applied path @ui @confirmation', async ({page}) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()
         
        await checkoutPage.applyVoucher('WELCOME10')
        await page.waitForLoadState('networkidle')
        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        await confirmationPage.assertDiscountApplied()
        await confirmationPage.assertConfirmationPageInformation(
            'test user',
            'test1@example.com',
            'Adventure Park'
        )
    })
})