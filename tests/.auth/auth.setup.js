import { test as setup, expect } from '@playwright/test'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

if (fs.existsSync('.env')) {
    dotenv.config()
}

const authFile = '.auth/user.json'

setup('Authenticate', async ({page}) => {
    const authDir = path.dirname(authFile)
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }

    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    const baseUrl = process.env.BASE_URL

    if (!email || !password || !baseUrl) {
    throw new Error('Missing required environment variables: TEST_USER_EMAIL, TEST_USER_PASSWORD, BASE_URL')
    }
    await page.goto(baseUrl)
    await page.locator('.btn.btn-secondary').click()
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', {name: 'Sign In'}).click()
    await expect(page.locator('#dealsGrid')).toBeVisible()
    await expect(page.locator('#userName')).toBeVisible()
    await page.context().storageState({ path: authFile })
})