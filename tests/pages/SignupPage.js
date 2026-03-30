export class SignUpPage {
    constructor(page) {
        this.page = page
        this.nameInput = page.locator('#name')
        this.emailInput = page.locator('#email')
        this.passwordInput = page.locator('#password')
        this.confirmPasswordInput = page.locator('#confirmPassword')
        this.CreateAccountButton = page.getByRole('button', {name: 'Create Account'})
        this.passwordToggle = page.locator('#togglePassword')
        this.nameError = page.locator('#nameError')           
        this.emailError = page.locator('#emailError')         
        this.passwordError = page.locator('#passwordError')   
        this.confirmPasswordError = page.locator('#confirmPasswordError') 
        this.errorMessage = page.locator('#errorMessage')
        this.termsCheckbox = page.locator('#termsCheckbox')
        this.termsError = page.locator('#termsError')
    }
    
   async goto() {
        await this.page.goto('/signup.html')
}
    async fillName(name) {
        await this.nameInput.fill(name)
    }

    async fillEmail(email) {
        await this.emailInput.fill(email)
}

    async fillPassword(password) {
        await this.passwordInput.fill(password)
}

    async fillConfirmPassword(confirmPassword) {
        await this.confirmPasswordInput.fill(confirmPassword)
}

    async clickCreateAccount() {
        await this.CreateAccountButton.click()
}

    async signUp(name, email, password, confirmPassword) {
        await this.fillName(name)
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.fillConfirmPassword(confirmPassword)
}

    async acceptTerms() {
        await this.termsCheckbox.check()
}
}