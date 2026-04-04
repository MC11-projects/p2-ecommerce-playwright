import { test, expect } from '@playwright/test'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'

test.describe('Logout Flow', () => {
    let homePage
    let loginPage

    test.beforeEach(async ({page}) => {
        await page.goto('/')
        homePage = new HomePage(page)
        loginPage = new LoginPage(page)
        })
    
    test ('User can logout and login again @smoke @auth @ui', async ({page}) => {
        await homePage.logout()
        await expect (page.locator('#toastContainer .toast-message')).toHaveText('Logged out successfully')
        await expect(homePage.signInButton).toBeVisible()
        await loginPage.goto()
        await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)
        await expect (page.locator('#toastContainer .toast-message')).toHaveText('Login successful!')
        await expect(homePage.userMenu).toBeVisible()
    })
    test('Direct checkout URL redirects to login after logout @auth @ui', async ({page}) => {
        await homePage.logout()
        await page.goto('/checkout.html')
        await expect(page).toHaveURL(/.*login.html/)
    })

    test('Browser back button after logout does not bypass auth @auth @ui', async ({page}) => {
        // Tests that after logout, back button doesn't bypass auth
        await page.goto('/checkout.html')
        await homePage.logout()
        await expect(homePage.signInButton).toBeVisible()
        await page.goBack()
        await expect(page).toHaveURL(/.*login.html/)
        await expect(homePage.userMenu).not.toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })
})    
