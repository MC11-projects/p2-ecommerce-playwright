import { test, expect } from '@playwright/test'
import { FiltersSection } from './pages/FiltersSection'
import { HomePage } from './pages/HomePage'

test.describe('Filters section', () => {
    let filtersSection
    let homePage

    test.beforeEach(async ({page}) => {
        filtersSection = new FiltersSection(page)
        homePage = new HomePage(page)
    })

    test('Search returns matching results @ui @smoke @filters', async () => {
        await homePage.goto()
        await filtersSection.searchDeals('Premium')
        await expect(homePage.dealCards).toHaveCount(1)
        await expect(homePage.dealsGrid).toContainText('Premium Car Wash & Detail')
    })

    test('Search with no matches shows empty state @ui @smoke @filters', async () => {
        await homePage.goto()
        await filtersSection.searchDeals('random')
        await expect(homePage.dealCards).toHaveCount(0)
        await expect(filtersSection.emptyDealsGrid).toContainText('No deals found', 'Try adjusting your search or filters')
    })

    test('Clear search shows all deals again @ui @filters', async ({page}) => {
        await homePage.goto()
        await page.waitForLoadState('networkidle')
        const initialCount = await homePage.dealCards.count()
        await filtersSection.searchDeals('sunset')
        await expect(homePage.dealCards).toHaveCount(1)
        await filtersSection.clearSearch()
        await expect(homePage.dealCards).toHaveCount(initialCount)
    })

    test('Filter by wellness category @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Wellness')
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()

            for (let i = 0; i < dealCount; i++) {
                await expect(homePage.dealCards.nth(i)).toContainText('Wellness')
            }
    })

    test('Filter by food category @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Food')
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()

            for (let i = 0; i < dealCount; i++) {
                await expect(homePage.dealCards.nth(i)).toContainText('Food')
            }
        
    })

    test('Filter by activities category @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Activities')
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()
        
            for (let i = 0; i < dealCount; i++) {
                await expect(homePage.dealCards.nth(i)).toContainText('Activities')
            }
    })

    test('Filter by services category @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Services')
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()
 
            for (let i = 0; i < dealCount; i++) {
                await expect(homePage.dealCards.nth(i)).toContainText('Services')
            }
    })

    test('Filter by entertainment category @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Entertainment')
        await expect(homePage.dealCards.first()).toBeVisible()
        const dealCount = await homePage.dealCards.count()

            for (let i = 0; i < dealCount; i++) {
                await expect(homePage.dealCards.nth(i)).toContainText('Entertainment')
            }
    })

    test('All Categories shows all available deals @ui @filters', async () => {
        await homePage.goto()
        await expect(homePage.dealCards.first()).toBeVisible()
        const initialCount = await homePage.dealCards.count()

        await filtersSection.selectCategory('Wellness')
        const filteredCount = await homePage.dealCards.count()
        expect(filteredCount).toBeLessThan(initialCount)
        
        await filtersSection.selectCategory('')
        await expect(homePage.dealCards).toHaveCount(initialCount)
    })

    test('Sort by newest @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectSort('Newest First')
        await page.waitForLoadState('networkidle')

        const firstDeal = await homePage.dealCards.first().getAttribute('data-deal-id')
        const secondDeal = await homePage.dealCards.nth(1).getAttribute('data-deal-id')
        const firstId = parseInt(firstDeal.match(/deal-(\d+)/)[1])
        const secondId = parseInt(secondDeal.match(/deal-(\d+)/)[1])
        expect(firstId).toBeGreaterThan(secondId)
    })

    test('Sort by highest discount @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectSort('Highest Discount')
        await page.waitForLoadState('networkidle')

        const firstDiscount = await page.locator('.deal-discount').first().textContent()
        const lastDiscount = await page.locator('.deal-discount').last().textContent()
        const firstValue = parseInt(firstDiscount.replace(/\D/g, ''))
        const lastValue = parseInt(lastDiscount.replace(/\D/g, ''))
        expect(firstValue).toBeGreaterThanOrEqual(lastValue)
    })

    test('Sort by price: low to high @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectSort('Price: Low to High')
        await page.waitForLoadState('networkidle')

        const firstPrice = await page.locator('.deal-price').first().textContent()
        const lastPrice = await page.locator('.deal-price').last().textContent()
        const firstValue = parseInt(firstPrice.replace(/\D/g, ''))
        const lastValue = parseInt(lastPrice.replace(/\D/g, ''))
        expect(firstValue).toBeLessThanOrEqual(lastValue)
    })

    test('Sort by price: high to low @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectSort('Price: High to Low')
        await page.waitForLoadState('networkidle')

        const firstPrice = await page.locator('.deal-price').first().textContent()
        const lastPrice = await page.locator('.deal-price').last().textContent()
        const firstValue = parseInt(firstPrice.replace(/\D/g, ''))
        const lastValue = parseInt(lastPrice.replace(/\D/g, ''))
        expect(firstValue).toBeGreaterThanOrEqual(lastValue)
    })
    
    test('Sort by expiration date @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectSort('Expiring Soon')
        await page.waitForLoadState('networkidle')

        const availableDeals = page.locator('.deal-card[data-disabled="false"]')
        const firstExpiry = await availableDeals.nth(0).locator('.deal-expires').textContent()
        const lastExpiry = await availableDeals.nth(-1).locator('.deal-expires').textContent()
        const firstDate = new Date(firstExpiry.replace('Expires:', '').trim())
        const lastDate = new Date(lastExpiry.replace('Expires:', '').trim())
        expect(firstDate.getTime()).toBeLessThanOrEqual(lastDate.getTime())
    })

    test('Search and category filters work together @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Activities')
        await expect(homePage.dealCards).toHaveCount(2)

        await filtersSection.searchDeals('Sun')
        await expect(homePage.dealCards).toHaveCount(1)
        await expect(homePage.dealCards).toContainText('Sunset Photography Workshop')
    })

    test('Category and sort filters work together @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectCategory('Activities')
        
        await filtersSection.selectSort('Price: Low to High')
        const firstPrice = await page.locator('.deal-price').first().textContent()
        const lastPrice = await page.locator('.deal-price').last().textContent()
        const firstValue = parseInt(firstPrice.replace(/\D/g, ''))
        const lastValue = parseInt(lastPrice.replace(/\D/g, ''))
        expect(firstValue).toBeLessThanOrEqual(lastValue)
    })

    test('Category, search sort filters work together @ui @filters', async () => {
        await homePage.goto()
        await filtersSection.selectCategory('Activities')
        
        await filtersSection.selectSort('Price: Low to High')
        await filtersSection.searchDeals('Premium')
        await expect(filtersSection.emptyDealsGrid).toContainText('No deals found', 'Try adjusting your search or filters')
    })

    test('Search with special characters shows empty state @ui @smoke @filters', async () => {
        await homePage.goto()
        await filtersSection.searchDeals('$@$%%')
        await expect(homePage.dealCards).toHaveCount(0)
        await expect(filtersSection.emptyDealsGrid).toContainText('No deals found', 'Try adjusting your search or filters')
    })

    test('Filters are maintained upon page refresh @ui @filters', async ({page}) => {
        await homePage.goto()
        await filtersSection.selectCategory('Activities')
        
        await filtersSection.selectSort('Price: High to Low')
        await page.reload()

        const firstPrice = await page.locator('.deal-price').first().textContent()
        const lastPrice = await page.locator('.deal-price').last().textContent()
        const firstValue = parseInt(firstPrice.replace(/\D/g, ''))
        const lastValue = parseInt(lastPrice.replace(/\D/g, ''))
        expect(firstValue).toBeGreaterThanOrEqual(lastValue)
    })

    test('Category Desync', async({page}) => {
        await homePage.goto()
        await filtersSection.selectCategory('Food')
        await page.waitForLoadState('networkidle')
        await filtersSection.searchDeals('Car Wash')
        await expect(filtersSection.emptyDealsGrid).toContainText('No deals found', 'Try adjusting your search or filters')
        await filtersSection.selectCategory('')
        await expect(homePage.dealsGrid).toContainText('Premium Car Wash & Detail')
    })
})