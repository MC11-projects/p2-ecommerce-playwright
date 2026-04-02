Portfolio Project 2: Daily Deals E-Commerce Platform - IN PROGRESS

Full-stack serverless e-commerce application with AWS backend and comprehensive end-to-end test automation. Features authentication, real-time deal browsing, shopping cart with quantity controls, and checkout with form validation. Built with AWS Lambda, DynamoDB, API Gateway, Cognito for auth, and tested with Playwright using multiple test patterns (storageState, helper functions, POM).

**Tech Stack:** JavaScript, Playwright, AWS (Lambda, DynamoDB, API Gateway, Cognito, S3, CloudFront), GitHub Actions CI/CD, Allure reporting

**Test Coverage:** 43 tests (18 auth + 14 deals + 10 cart + 1 checkout)

---

## Features Implemented

### Authentication & User Management
- Login, logout, signup flows with AWS Cognito
- Session persistence with storageState pattern
- Protected routes (checkout requires authentication)

### Deal Browsing
- Real-time deal display with filtering and search
- Stock tracking and sold-out states
- Expiration handling
- Deal details modal with quantity selection

### Shopping Cart
- Add items with quantity validation (1-10 per purchase)
- Update quantities, remove items
- Session persistence (survives page reload)
- Multi-item cart with live total calculation

### Checkout (In Progress)
- Order summary display
- Customer information and shipping address forms
- Payment form with card validation
- Field-level error messages
- E2E checkout flow

---

## Roadmap

### Current Sprint
- Complete checkout UI tests (form validation, error states, voucher application)
- Checkout API tests (POST /orders validation)
- Order confirmation page and tests

### Next Sprint
- **Order Management**
  - Order history page with status tracking (Active, Redeemed, Expired, Failed, Refunded, Gifted)
  - Order redemption functionality
  - Gifting flows (checkout gift option + post-purchase transfer)

- **Testing & Infrastructure**
  - Performance testing (k6 or JMeter)
  - Terraform for infrastructure as code
  - Grafana dashboards

### Future Enhancements
- Email notifications (order confirmation, gifting)
- Admin dashboard for order management
- Advanced voucher system (multiple discount types)
- User profile page
