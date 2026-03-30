import { test, expect } from '@playwright/test'
import { SignUpPage } from './pages/SignupPage'

test.describe('Signup Flow', () => {
    let signUpPage

    test.beforeEach(async ({page}) => {
        signUpPage = new SignUpPage(page)
        await signUpPage.goto()
    })

    test('User can signup', async ({page}) => {
        const dynamicEmail = `test+${Date.now()}@example.com`
        await signUpPage.signUp('test test', dynamicEmail, process.env.TEST_USER_PASSWORD, process.env.TEST_USER_PASSWORD)
        await signUpPage.acceptTerms()
        await signUpPage.clickCreateAccount()
        await expect(page.locator('#toastContainer .toast-message')).toHaveText('Account created successfully!')
        await expect(page).toHaveURL(/.*index.html/)
    })

    test('User tries to signup without agreeing to the Terms and Conditions', async ({page}) => {
        const dynamicEmail = `test+${Date.now()}@example.com`
        await signUpPage.signUp('test test', dynamicEmail, process.env.TEST_USER_PASSWORD, process.env.TEST_USER_PASSWORD)
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.termsError).toBeVisible()
    })

    test('User inputs invalid email format', async () => {
        await signUpPage.signUp('test test', 'test1', process.env.TEST_USER_PASSWORD, process.env.TEST_USER_PASSWORD)
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.emailError).toBeVisible()
        await expect(signUpPage.emailError).toContainText('Please enter a valid email address')
        
    })

    test('User inputs passwords that do not match', async () => {
        await signUpPage.signUp('test', process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD, 'test')
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.confirmPasswordError).toBeVisible()
        await expect(signUpPage.confirmPasswordError).toContainText('Passwords do not match')
    })
    test('User tries to signup with empty fields', async() => {
        await signUpPage.signUp('', '', '', '')
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.nameError).toBeVisible()
        await expect(signUpPage.nameError).toContainText('Name is required')
        await expect(signUpPage.emailError).toBeVisible()
        await expect(signUpPage.emailError).toContainText('Email is required')
        await expect(signUpPage.passwordError).toBeVisible()
        await expect(signUpPage.passwordError).toContainText('Password is required')
        await expect(signUpPage.confirmPasswordError).toBeVisible()
        await expect(signUpPage.confirmPasswordError).toContainText('Please confirm your password')
    })

    test('User tries to signup with a short password', async ({page}) => {
        // Tests short password
        await signUpPage.signUp('test test', process.env.TEST_USER_EMAIL, 'test', 'test')
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.passwordError).toBeVisible()
        await expect(signUpPage.passwordError).toContainText('Password must be at least 8 characters')
    })

    test('User tries to signup with a weak password', async () => {
        //Tests password without lowercase, uppercase, or numbers (same error)
        await signUpPage.signUp('test test', process.env.TEST_USER_EMAIL, 'testtest', 'testtest')
        await signUpPage.clickCreateAccount()
        await expect(signUpPage.passwordError).toBeVisible()
        await expect(signUpPage.passwordError).toContainText('Password must contain uppercase, lowercase, and numbers')
    })

    test('User tries to signup with an already registered email', async({page}) => {
        await signUpPage.signUp('test test', process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD, process.env.TEST_USER_PASSWORD)
        await signUpPage.acceptTerms()
        await signUpPage.clickCreateAccount()

        await expect(signUpPage.errorMessage).toBeVisible()
        await expect(signUpPage.errorMessage).toContainText('An account with this email already exists. Please sign in instead.')
        await expect (page.locator('#toastContainer .toast-message')).toHaveText('An account with this email already exists. Please sign in instead.')
    })

    test('User can toggle password visibility', async () => {
    await signUpPage.passwordInput.fill('Password123!')

    await expect(signUpPage.passwordInput).toHaveAttribute('type', 'password')
    await signUpPage.passwordToggle.click()
    await expect(signUpPage.passwordInput).toHaveAttribute('type', 'text')
})

    test('Terms and Conditions checkbox and link functionality', async({page, context}) => {
        await expect(signUpPage.termsCheckbox).toBeVisible()
        await expect(signUpPage.termsCheckbox).not.toBeChecked()
        await signUpPage.termsCheckbox.check()
        await expect(signUpPage.termsCheckbox).toBeChecked()
        await signUpPage.termsCheckbox.uncheck()
        await expect(signUpPage.termsCheckbox).not.toBeChecked()

        const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.getByText('Terms & Conditions').click() 
    ])
        await newPage.waitForLoadState();
        await expect(newPage).toHaveURL(/.*terms.html/);
        await expect(newPage.locator('h1', {hasText: 'Terms & Conditions'})).toBeVisible()
        
        await newPage.close();
    })
})