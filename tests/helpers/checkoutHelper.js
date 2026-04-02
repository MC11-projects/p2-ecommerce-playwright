import { HomePage } from '../pages/HomePage'
import { CartModal } from '../pages/CartModal'

export async function navigateToCheckout(page, dealId = 'deal-003') {
    const homePage = new HomePage(page)
    const cartModal = new CartModal(page)
    
    await homePage.goto()
    await homePage.clickDealById(dealId)
    await cartModal.addToCartButton.click()
    await cartModal.clickCart()
    await cartModal.cartProceedToCheckout.click()

    await page.waitForURL('**/checkout.html')
    await page.waitForSelector('#customerName', { state: 'visible' })
}