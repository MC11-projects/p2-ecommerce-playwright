Portfolio Project 2: Daily Deals E-Commerce Platform (in progress)

Full-stack serverless e-commerce application with AWS backend (DynamoDB, Lambda, API Gateway, Cognito) and comprehensive Playwright test automation. Features authentication flows, shopping cart, checkout with payment validation, and security hardening including JWT authorization and rate limiting.

Tech Stack: JavaScript, Playwright, AWS (Lambda, DynamoDB, API Gateway, Cognito, S3, CloudFront), CI/CD with GitHub Actions, Allure reporting


## Roadmap

### In Progress
- Cart functionality tests (update quantity, remove items)

### Planned Features
- **Checkout & Order Management**
  - Order history page with status tracking (Active, Redeemed, Expired, Failed, Refunded, Gifted)
  - Gifting functionality (checkout + post-purchase transfer)

- **API Development**
  - Order history endpoints (GET /orders)
  - Order redemption (POST /orders/:orderId/redeem)
  - Gifting endpoints (POST /orders/:orderId/gift)

- **Testing Expansion**
  - Checkout flow tests (UI + API)
  - Order confirmation tests
  - Order history tests
  - Gifting flow tests
  - Performance testing with JMeter

- **Infrastructure**
  - Terraform for infrastructure as code
  - Grafana monitoring dashboards

### Future Enhancements
- Email notifications (order confirmation, gifting)
- Admin dashboard for order management
- Advanced voucher system (percentage + fixed amount discounts)
- User profile page
