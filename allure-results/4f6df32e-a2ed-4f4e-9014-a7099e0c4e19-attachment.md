# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - heading "🎁 DailyDeals" [level=1] [ref=e5]
      - generic [ref=e6]:
        - button "Toggle dark mode" [ref=e7] [cursor=pointer]: 🌙
        - button "👤 test test" [ref=e9] [cursor=pointer]:
          - generic [ref=e10]: 👤
          - generic [ref=e11]: test test
        - button "🛒 Cart (0)" [ref=e12] [cursor=pointer]
  - main [ref=e13]:
    - generic [ref=e14]:
      - textbox "Search deals" [ref=e16]:
        - /placeholder: Search deals...
      - generic [ref=e17]:
        - combobox "Filter by category" [ref=e18] [cursor=pointer]:
          - option "All Categories" [selected]
          - option "Wellness"
          - option "Food"
          - option "Activities"
          - option "Services"
          - option "Entertainment"
        - combobox "Sort deals" [ref=e19] [cursor=pointer]:
          - option "Newest First" [selected]
          - option "Highest Discount"
          - 'option "Price: Low to High"'
          - 'option "Price: High to Low"'
          - option "Expiring Soon"
    - generic [ref=e21]: Loading deals...
```