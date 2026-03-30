export class HomePage {
    constructor(page) {
        this.page = page
        this.userMenuButton = page.locator('#userMenuBtn')
        this.logoutButton = page.locator('#logoutBtn')
        this.userMenu = page.locator('#userMenu')
        this.signInButton = page.getByText('Sign In')
    }
    
    async goto() {
        await this.page.goto('/')
    }
    
    async logout() {
        await this.userMenuButton.click()
        await this.logoutButton.click()
    }
}