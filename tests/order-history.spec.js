import { test, expect } from '@playwright/test'
import { OrderHistoryPage } from './pages/OrderHistory'
import { CheckoutPage } from './pages/CheckoutPage'
import { navigateToCheckout } from './helpers/checkoutHelper'

test.describe('Order History', () => {
    let orderHistoryPage
    let checkoutPage

    test.beforeEach(async ({ page }) => {
        orderHistoryPage = new OrderHistoryPage(page)
        checkoutPage = new CheckoutPage(page)
    })

    test('Order History page displays filters and vouchers after purchase', async ({ page }) => {
        await navigateToCheckout(page)
        await expect(page.locator('#orderItems .order-item')).toBeVisible()

        await checkoutPage.fillCustomerInfo('test user', 'test1@example.com')
        await checkoutPage.fillShippingAddress('111 Test Street', 'Bucharest', 'Bucharest', '11111')
        await checkoutPage.fillPaymentInfo('4111111111111111', 'John Doe', '12/26', '123')
        await checkoutPage.completePurchase()
        await expect(page).toHaveURL(/confirmation.html/)
        await orderHistoryPage.clickViewMyVouchers()
        await expect(orderHistoryPage.OrderHistoryPageTitle).toContainText('My Vouchers')
        await expect(orderHistoryPage.StatusFilter).toBeVisible()
        await expect(orderHistoryPage.ExpiryFilter).toBeVisible()
        await expect(orderHistoryPage.VouchersList).toBeVisible()
    })

})
