# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - link "🎁 DailyDeals" [ref=e5] [cursor=pointer]:
      - /url: index.html
      - heading "🎁 DailyDeals" [level=1] [ref=e6]
  - main [ref=e7]:
    - generic [ref=e9]:
      - heading "Welcome Back" [level=1] [ref=e10]
      - paragraph [ref=e11]: Sign in to your account
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email
          - textbox "Email" [ref=e15]:
            - /placeholder: your@email.com
            - text: testemail
          - generic [ref=e16]: Please enter a valid email address
        - generic [ref=e17]:
          - generic [ref=e18]: Password
          - generic [ref=e19]:
            - textbox "Password" [ref=e20]:
              - /placeholder: Enter your password
            - button "Show password" [ref=e21] [cursor=pointer]: 👁️
          - generic [ref=e22]: Password is required
        - button "Sign In" [active] [ref=e23] [cursor=pointer]
      - paragraph [ref=e25]:
        - text: Don't have an account?
        - link "Sign up" [ref=e26] [cursor=pointer]:
          - /url: signup.html
```