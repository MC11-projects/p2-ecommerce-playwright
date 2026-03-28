import { test, expect } from "allure-playwright";
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env')) {
    dotenv.config()
}

test('for initial commit', async ({page}) => {
    const baseUrl = process.env.BASE_URL
    await page.goto(baseUrl)
    await expect(page.getByText('DailyDeals')).toBeVisible()
    await expect(page.locator('.theme-toggle')).toBeVisible()
})