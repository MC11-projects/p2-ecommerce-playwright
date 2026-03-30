export class LoginPage {
    constructor(page) {
        this.page = page
        this.emailInput = page.locator('#email')
        this.passwordInput = page.locator('#password')
        this.submitButton = page.getByRole('button', {name: 'Sign In'})
        this.errorMessage = page.locator('#errorMessage')
        this.emailError = page.locator('#emailError')
        this.passwordError = page.locator('#passwordError')
    }
    
   async goto() {
        await this.page.goto('/login.html')
}

    async fillEmail(email) {
        await this.emailInput.fill(email)
}

    async fillPassword(password) {
        await this.passwordInput.fill(password)
}

    async clickSubmit() {
        await this.submitButton.click()
}

    async login(email, password) {
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.clickSubmit()
}
}