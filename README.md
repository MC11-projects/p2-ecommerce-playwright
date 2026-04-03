Portfolio Project 2: Daily Deals E-Commerce Platform

Full-stack serverless e-commerce application with AWS backend and comprehensive end-to-end test automation. Features authentication, real-time deal browsing, shopping cart with quantity controls, and multi-step checkout with voucher support and form validation. Built with AWS Lambda, DynamoDB, API Gateway, Cognito for auth, and tested with Playwright using multiple test patterns (storageState, helper functions, POM).

**Tech Stack:** JavaScript, Playwright, AWS (Lambda, DynamoDB, API Gateway, Cognito, S3, CloudFront), GitHub Actions CI/CD, Allure reporting

**Test Coverage:** 57 tests (18 auth + 14 deals + 10 cart + 15 checkout)

---

## Features Implemented

### Authentication & User Management
- Login, logout, signup flows with AWS Cognito
- Session persistence with storageState pattern
- Protected routes (checkout requires authentication)

### Deal Browsing
- Real-time deal display from DynamoDB
- Stock tracking with sold-out and low-stock indicators
- Expiration handling and expired deal states
- Deal details modal with quantity selection and max quantity validation
- Category display and deal metadata

### Shopping Cart
- Add items with quantity validation (1-10 per purchase)
- Update quantities with +/- controls
- Remove items from cart
- Session persistence across page reloads
- Multi-item cart with live subtotal calculation
- Cart validation (removes expired/sold-out items automatically)
- Cross-tab synchronization via localStorage

### Checkout
- Order summary with item details and pricing
- Customer information form (name, email)
- Shipping address form (address, city, state, ZIP)
- Payment form with card validation (number, name, expiry, CVV)
- Field-level validation with inline error messages
- Voucher code system (apply, remove, persistence)
- Discount calculation with edge case handling (100% vouchers, negative totals)
- Cart manipulation prevention (voucher cleared on cart empty)
- Multi-tab race condition handling
- E2E checkout flow with order submission

---

## Test Architecture

### Test Patterns Demonstrated
- **storageState pattern** (Auth tests) - Session persistence across tests
- **Helper functions** (Checkout tests) - Reusable navigation logic
- **beforeEach setup** (Deals, Cart tests) - Standard initialization
- **Page Object Model** - All tests use POM for maintainability

### Test Coverage by Feature
- **Authentication (18 tests)** - Login, logout, signup, session persistence
- **Deals (14 tests)** - UI display, modals, stock limits, expired/sold-out states, API contract validation
- **Cart (10 tests)** - Add/remove items, quantity controls, persistence, validation, cross-tab sync
- **Checkout (15 tests)** - Happy path, field validation, card validation, voucher application/removal, edge cases (negative balance, cart manipulation)

---

## Roadmap

### Current Sprint (In Progress)
- Order confirmation page and tests
- Checkout API tests (POST /orders validation)
- Deal search and filtering UI tests (search, category filter, sort options)

### Next Sprint
- **Order Management**
  - Order history page with status tracking (Active, Redeemed, Expired, Failed, Refunded, Gifted)
  - Order redemption functionality
  - Gifting flows (checkout gift option + post-purchase transfer)

- **Testing & Infrastructure**
  - Performance testing (k6)
  - Terraform for infrastructure as code
  - Grafana dashboards (with Prometheus)

### Future Enhancements
- Email notifications via SES (order confirmation, gifting)
- Event-driven architecture with SQS
- Admin dashboard for order management
- Advanced voucher system (percentage + fixed amount discounts)
- User profile page with order history