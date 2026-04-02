import { test, expect } from '@playwright/test'
import { CartModal } from './pages/CartModal'
import { HomePage } from './pages/HomePage'

test.describe('Cart', () => {
    let cartModal
    let homePage

    test.beforeEach(async ({page}) => {
            cartModal = new CartModal(page)
            homePage = new HomePage(page)
            await homePage.goto()
    })

    test('Empty cart functionality', async () => {
        await cartModal.clickCart()
        await expect(cartModal.cartTitle).toContainText('Shopping Cart')
        await expect(cartModal.cartModalEmpty).toBeVisible()
        await expect(cartModal.cartModalEmpty).toContainText('Your cart is empty')
        await expect(cartModal.cartModalEmpty).toContainText('Add some amazing deals to get started!')
    })

    test('User can view cart', async () => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        await expect(cartModal.cartTitle).toContainText('Shopping Cart')
        await expect(cartModal.cartItemImage).toBeVisible()
        await expect(cartModal.cartItemTitle).toContainText('Adventure Park Day Pass')
        const dealPrice = await cartModal.cartItemPrice.textContent()
        expect(dealPrice).toMatch(/\$\d+ × \d+ = \$\d+\.\d{2}/)

        const subtotalText = await cartModal.cartSummarySubtotal.textContent()
        expect(subtotalText).toMatch(/Subtotal:\s*\$\d+\.\d{2}/)
        const totalText = await cartModal.cartSummaryTotal.textContent()
        expect(totalText).toMatch(/Total:\s*\$\d+\.\d{2}/)
    })

    test('User can close the cart modal', async () => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        await expect(cartModal.cartItemTitle).toContainText('Adventure Park Day Pass')
        await cartModal.clickCloseCart()
        await expect(cartModal.cartModalClosed).not.toBeVisible()
        await cartModal.clickCart()
        await expect(cartModal.cartItemTitle).toContainText('Adventure Park Day Pass')
    })

    test('User can update quantity of deals in cart', async () => {
        // To find a way to not rely on hardcoded checks
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        
        await expect(cartModal.cartQuantityDisplay).toContainText('1')
        await expect(cartModal.cartItemPrice).toContainText('$35 × 1 = $35.00')
        
        await cartModal.increaseQuantityInCart()
        await expect(cartModal.cartQuantityDisplay).toContainText('2')
        await expect(cartModal.cartItemPrice).toContainText('$35 × 2 = $70.00')
        
        await cartModal.decreaseQuantityInCart()
        await expect(cartModal.cartQuantityDisplay).toContainText('1')
        await expect(cartModal.cartItemPrice).toContainText('$35 × 1 = $35.00')
    })

    test('Cart totals updates when quantity changes', async () => {
        // To find a way to not rely on hardcoded checkss
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        
        await expect(cartModal.cartSummarySubtotal).toContainText('$35.00')
        await expect(cartModal.cartSummaryTotal).toContainText('$35.00')
        
        await cartModal.increaseQuantityInCart()
        await expect(cartModal.cartSummarySubtotal).toContainText('$70.00')
        await expect(cartModal.cartSummaryTotal).toContainText('$70.00')
        
        await cartModal.decreaseQuantityInCart()
        await expect(cartModal.cartSummarySubtotal).toContainText('$35.00')
        await expect(cartModal.cartSummaryTotal).toContainText('$35.00')
    })

    test('User can remove items and see empty cart state', async () => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()
        await cartModal.removeDealFromCart()
        await expect(cartModal.cartModalClosed).toBeHidden()
        await expect(homePage.cartHeaderCount).toContainText('0') 
    })

    test('Quantity cannot exceed the maximum limit of 10', async () => {
        await homePage.clickDealById('deal-003')
        await homePage.quantityInput.fill('10')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()

        await expect(cartModal.cartQuantityDisplay).toHaveText('10')
        await expect(cartModal.cartQuantityPlus).toBeDisabled()
        await expect(cartModal.cartQuantityDisplay).toHaveText('10')
    })

    test('Quantity cannot go below 1', async () => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()

        await expect(cartModal.cartQuantityDisplay).toHaveText('1')
        await expect(cartModal.cartQuantityMinus).toBeDisabled()
    })

    test('Multi deal interaction', async () => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await homePage.clickDealById('deal-001')
        await cartModal.addToCartButton.click()
        await cartModal.clickCart()

        const firstItem = cartModal.cartItemTitle.nth(0);
        const secondItem = cartModal.cartItemTitle.nth(1);
        await expect(firstItem).toContainText('Adventure Park Day Pass')
        await expect(secondItem).toContainText('Spa Day Package - Luxury Retreat')
        const totalText = await cartModal.cartSummaryTotal.textContent()
        expect(totalText).toMatch(/Total:\s*\$\d+\.\d{2}/)
    })

    test('Session Persistence', async ({page}) => {
        await homePage.clickDealById('deal-003')
        await cartModal.addToCartButton.click()
        await homePage.clickDealById('deal-001')
        await cartModal.addToCartButton.click()
        await page.reload()
        await expect(homePage.dealsGrid).toBeVisible()
        await expect(homePage.dealCards.first()).toBeVisible()
        await cartModal.clickCart()
        const firstItem = cartModal.cartItemTitle.nth(0);
        const secondItem = cartModal.cartItemTitle.nth(1);
        await expect(firstItem).toContainText('Adventure Park Day Pass')
        await expect(secondItem).toContainText('Spa Day Package - Luxury Retreat')
    })
})