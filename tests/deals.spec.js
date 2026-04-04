import { test, expect } from '@playwright/test'
import { HomePage } from './pages/HomePage'

test.describe('Deals', () => {
    let homePage

    test.beforeEach(async ({page}) => {
            homePage = new HomePage(page)
            await homePage.goto()
        })

    test('Deals grid loads and displays deals @smoke @deals @ui', async () => {
        await expect(homePage.dealsGrid).toBeVisible()
        await expect(homePage.dealImage.first()).toBeVisible()
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()
        expect(dealCount).toBeGreaterThan(0)
    })

    test('Click deal opens modal @deals @ui', async () => {
        await homePage.dealCards.first().click()
        await expect(homePage.dealModal).toBeVisible()
    })

    test('Deal modal displays all info @deals @ui', async () => {
        await homePage.clickDealById('deal-003')
        await expect(homePage.dealModal).toBeVisible()
        await expect(homePage.dealModal).toContainText('Adventure Park')
        await expect(homePage.dealModal).toContainText('$35')
        await expect(homePage.dealModal).toContainText(/Available: \d+/)
        await expect(homePage.addToCartButton).toBeVisible()
    })

    test('Deal card displays correct info @deals @ui', async () => {
        const deal = await homePage.getDealById('deal-003')
        await expect(deal).toContainText('Adventure Park')
        await expect(deal).toContainText('$35')
        await expect(deal).toContainText(/\d+ available/)
    })

    test('Deal modal closing functionality @deals @ui', async () => {
        await homePage.clickDealById('deal-003')
        await homePage.modalCloseButton.click()
        await expect(homePage.dealModal).not.toBeVisible()
    })

    test('Quantity selector increase @deals @ui', async () => {
        await homePage.clickDealById('deal-003')
        await expect(homePage.quantityInput).toHaveValue('1')
        await homePage.quantityInputPlusButton.click()
        await expect(homePage.quantityInput).toHaveValue('2')
    })

    test('Quantity selector decrease @deals @ui', async () => {
        await homePage.clickDealById('deal-003')
        await expect(homePage.quantityInput).toHaveValue('1')
        await homePage.quantityInputPlusButton.click()
        await expect(homePage.quantityInput).toHaveValue('2')
        await homePage.quantityInputMinusButton.click()
        await expect(homePage.quantityInput).toHaveValue('1')
        await homePage.quantityInputMinusButton.click()
        await expect(homePage.quantityInput).toHaveValue('1')
    })

    test('Add to cart @smoke @deals @ui', async ({page}) => {
        await expect(homePage.cartHeaderCount).toContainText('0')
        await homePage.clickDealById('deal-003')
        await homePage.addToCartButton.click()
        await expect (page.locator('#toastContainer .toast-message')).toHaveText('Added 1 × Adventure Park Day Pass to cart!')
        await expect(homePage.dealModal).not.toBeVisible()
        await expect(homePage.cartHeaderCount).toContainText('1')
        await page.reload()
        await expect(homePage.cartHeaderCount).toContainText('1')
    })

    test('Expired deal @deals @ui', async () => {
        await homePage.clickDealById('deal-005')
        await expect(homePage.dealModal).toContainText('This deal has expired')
        await expect(homePage.addToCartButton).not.toBeVisible()
        await expect(homePage.quantityInput).not.toBeVisible()
        await expect(homePage.quantityInputMinusButton).not.toBeVisible()
        await expect(homePage.quantityInputPlusButton).not.toBeVisible()

    })

    test('Sold out deal @deals @ui', async () => {
        await homePage.clickDealById('deal-004')
        await expect(homePage.dealModal).toContainText('This deal is sold out')
        await expect(homePage.addToCartButton).not.toBeVisible()
        await expect(homePage.quantityInput).not.toBeVisible()
        await expect(homePage.quantityInputMinusButton).not.toBeVisible()
        await expect(homePage.quantityInputPlusButton).not.toBeVisible()
    })

    test('Stock limit functionality @deals @ui', async () => {
        const lowStockDeal = await homePage.getDealById('deal-002')
        await expect(lowStockDeal).toContainText(/Only \d+ left!/)
        await homePage.clickDealById('deal-002')
        await homePage.quantityInput.fill('99')
        await expect(homePage.dealModal).toContainText('Only 1 available. Please adjust quantity.')
        await expect(homePage.addToCartButton).toBeDisabled()
    })

    test('GET deals response structure via API @deals @api', async ({request}) => {
        const response = await request.get(`${process.env.API_BASE_URL}/deals`)
        
        expect(response.status()).toBe(200)
        
        const data = await response.json()
        expect(data).toHaveProperty('deals')
        expect(Array.isArray(data.deals)).toBe(true)
        expect(data.deals.length).toBeGreaterThan(0)

        const firstDeal = data.deals[0]
        expect(firstDeal).toMatchObject({
            dealId: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            price: expect.any(Number),
            originalPrice: expect.any(Number),
            discountPercent: expect.any(Number),
            quantity: expect.any(Number),
            category: expect.any(String),
            imageUrl: expect.any(String),
            expiresAt: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    test('Verify deal-005 is expired in API @deals @api', async ({request}) => {
        const response = await request.get(`${process.env.API_BASE_URL}/deals`)
        const data = await response.json()
        
        const expiredDeal = data.deals.find(d => d.dealId === 'deal-005')
        expect(expiredDeal).toBeDefined()
        
        const expiryDate = new Date(expiredDeal.expiresAt)
        expect(expiryDate.getTime()).toBeLessThan(Date.now())
    })

    test('Verify deal-004 is sold out in API', async ({request}) => {
        const response = await request.get(`${process.env.API_BASE_URL}/deals`)
        const data = await response.json()
        
        const soldOutDeal = data.deals.find(d => d.dealId === 'deal-004')
        expect(soldOutDeal).toBeDefined()
        expect(soldOutDeal.quantity).toBe(0)
    })
})