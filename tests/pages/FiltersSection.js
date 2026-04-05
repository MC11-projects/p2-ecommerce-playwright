export class FiltersSection {
    constructor(page) {
        this.page = page
        this.searchField = page.locator('#searchInput')
        this.categoryDropdown = page.locator('#categoryFilter')
        this.sortingDropdown = page.locator('#sortSelect')
        this.emptyDealsGrid = page.locator('.empty-state')
    }

    async searchDeals(value) {
        await this.searchField.fill(value)
    }

    async selectCategory(value) {
        await this.categoryDropdown.selectOption(value)
    }

    async selectSort(value) {
        await this.sortingDropdown.selectOption(value)
    }
    
    async clearSearch() {
        await this.searchField.clear()
    }
}