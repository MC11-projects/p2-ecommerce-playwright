export class OrderHistoryPage {
    constructor(page) {
       this.page = page
       this.HomePageOrderHistoryPageAccessButton = page.locator('a[href="order-history.html"]')
       this.ConfirmationPageOrderHistoryPageAccesssButton = page.getByRole('link', { name: 'View My Vouchers' })
       this.OrderHistoryPageTitle = page.locator('.container.order-history-main h2')
       this.StatusFilter = page.locator('#statusFilter')
       this.ExpiryFilter = page.locator('#expiryFilter')
       this.VouchersList = page.locator('#vouchersContainer')
       this.VoucherInfo = page.locator('.voucher-info')
       this.VoucherTitle = page.locator('.voucher-title')
       this.VoucherActiveStatus = page.locator('.voucher-status.active')
       this.VoucherRedeemedStatus = page.locator('.voucher-status.redeemed')
       this.VoucherExpiredStatus = page.locator('.voucher-status.expired')
       this.VoucherGiftedStatus = page.locator('.voucher-status.gifted')
       this.VoucherCode = page.locator('.voucher-code')
       this.VoucherPrice = page.locator('.voucher-price')
       this.VoucherExpiryDate = page.locator('.voucher-meta-item').filter({ hasText: 'Expires:' })
       this.VoucherRedeemButton = page.getByRole('button', {name: 'Redeem'})
       this.VoucherGiftButton = page.getByRole('button', {name: 'Gift'})
       this.VoucherViewDetailsButton = page.getByRole('button', {name: 'View Details'})
       this.EmptyStateVoucherPage = page.locator('#emptyState')
       this.VoucherDetailsModalContent = page.locator('#detailsModalContent') 
       this.VoucherGiftModalContent = page.locator('#giftModalContent') 
       this.GiftModalEmailRecipient = page.locator('#recipientEmail')
       this.GiftModalSendGiftButton = page.getByRole('button', {name: 'Send Gift'})
       this.RedeemModalContent = page.locator('#redeemModalContent')
       this.RedeemModalConfirmButton = page.getByRole('button', {name: 'Confirm Redeem'})
       this.ModalCloseButton = page.locator('.modal.active .modal-close')
       this.ModalCancelButton = page.getByRole('button', {name: 'Cancel'})
       this.VoucherRebuyButton = page.getByRole('button', {name: 'Re-buy'})
    }

    async goto() {
        await this.page.goto('/order-history.html')
    }

    async selectStatus(value) {
        await this.StatusFilter.selectOption(value)
    }

    async selectExpiryTimeline(value) {
        await this.ExpiryFilter.selectOption(value)
    }

    async clickViewDetails() {
        await this.VoucherViewDetailsButton.click()
    }
        
    async clickGift() {
        await this.VoucherGiftButton.click()
    }

    async sendGift(email) {
        await this.GiftModalEmailRecipient.fill(email)
        await this.GiftModalSendGiftButton.click()
    }

    async clickRedeem() {
        await this.VoucherRedeemButton.click()
    }

    async clickConfirmRedeem() {
        await this.RedeemModalConfirmButton.click()
    }

    async clickModalClose() {
        await this.ModalCloseButton.click()
    }

    async clickRebuy() {
        await this.VoucherRebuyButton.click()
    }

    async clickViewMyVouchers() {
        await this.ConfirmationPageOrderHistoryPageAccesssButton.click()
    }
}