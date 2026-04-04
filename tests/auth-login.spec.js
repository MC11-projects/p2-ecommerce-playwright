import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'



test.describe('Authentication', () => {
    let loginPage
    
    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page)
        await loginPage.goto()
    })
     
    test('Login with valid credentials @smoke @auth @ui', async ({page, request}) => {
        await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)

        await expect (page.locator('#toastContainer .toast-message')).toHaveText('Login successful!')
        await expect(page).toHaveURL(/.*index.html/)
        await expect(page.locator('#userMenu')).toBeVisible()
        await expect(page.locator('#userName')).toBeVisible()
        await expect(page.getByText('DailyDeals')).toBeVisible()
        await expect(page.locator('.theme-toggle')).toBeVisible()
        await expect(page.getByText('Sign In')).not.toBeVisible()
    })


    test('Login with invalid email credential @auth @ui', async ({page}) => {
        await loginPage.login('testemail', process.env.TEST_USER_PASSWORD)
            
        await expect(loginPage.emailError).toBeVisible()
        await expect(loginPage.emailError).toContainText('Please enter a valid email address')
        await expect(page).toHaveURL(/.*login.html/)
    })

    test('Login with no email credential @auth @ui', async ({page}) => {
        await loginPage.login('', process.env.TEST_USER_PASSWORD)
            
        await expect(loginPage.emailError).toBeVisible()
        await expect(loginPage.emailError).toContainText('Email is required')
        await expect(page).toHaveURL(/.*login.html/)
    })

    test('Login with invalid password credentials @auth @ui', async ({page}) => {
        await loginPage.login(process.env.TEST_USER_EMAIL, 'testpassword')
            
        await expect (page.locator('#toastContainer .toast-message')).toHaveText('Incorrect password. Please try again.')
        await expect(loginPage.errorMessage).toBeVisible()
        await expect(loginPage.errorMessage).toContainText('Incorrect password. Please try again.')
        await expect(page).toHaveURL(/.*login.html/)
    })

    test('Login with no password @auth @ui', async ({page}) => {
        await loginPage.login(process.env.TEST_USER_EMAIL, '')
            
        await expect(loginPage.passwordError).toBeVisible()
        await expect(loginPage.passwordError).toContainText('Password is required')
        await expect(page).toHaveURL(/.*login.html/)
    })
})
