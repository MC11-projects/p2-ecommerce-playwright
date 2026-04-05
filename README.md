# Portfolio Project 2: Daily Deals E-Commerce Platform

Full-stack serverless e-commerce application with AWS backend and comprehensive end-to-end test automation. Features authentication, real-time deal browsing, shopping cart with quantity controls, and multi-step checkout with voucher support and form validation. Built with AWS Lambda, DynamoDB, API Gateway, Cognito for auth, and tested with Playwright using multiple test patterns (storageState, helper functions, POM).

**Tech Stack:** JavaScript, Playwright, AWS (Lambda, DynamoDB, API Gateway, Cognito, S3, CloudFront), GitHub Actions CI/CD, Allure reporting

**Test Coverage:** 101 tests (82 UI + 17 API + 2 setup files)

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

### Order Confirmation
- Order confirmation page with order details
- Customer and shipping information display
- Applied discount and voucher tracking
- Navigation guards (prevent direct access without order)
- Auto-redirect on page refresh (prevents stale confirmation views)
- Cart clearing after successful purchase
- Continue shopping functionality

### Search & Filtering
- Real-time search across deal titles and descriptions
- Category filtering (Wellness, Food, Activities, Services, Entertainment)
- Sort options (Newest, Price Low/High, Highest Discount, Expiring Soon)
- Combined filter support (search + category + sort)
- Empty state handling for no results
- Filter persistence across page refreshes
- Clear search functionality

### API Integration
- RESTful API Gateway endpoints for order creation
- JWT-based authentication with Cognito ID tokens
- Request payload validation (missing fields, boundary quantities)
- Business logic validation (deal availability, stock management, expiration)
- Voucher application and discount calculation
- Email format validation

---

## Test Architecture

### Test Patterns Demonstrated
- **storageState pattern** (Auth tests) - Session persistence across tests
- **Helper functions** (Checkout tests) - Reusable navigation logic
- **beforeEach setup** (Deals, Cart tests) - Standard initialization
- **Page Object Model** - All tests use POM for maintainability
- **API integration testing** - Direct API Gateway validation with Playwright request context

### Test Coverage by Feature

**UI Tests (82 tests)**
- **Authentication (18 tests)** - Login (5), logout (3), signup (10) with session persistence
- **Deals (11 tests)** - UI display, modals, stock limits, expired/sold-out states
- **Cart (11 tests)** - Add/remove items, quantity controls, persistence, validation, cross-tab sync
- **Checkout (15 tests)** - Happy path, field validation, card validation, voucher application/removal, edge cases (negative balance, cart manipulation)
- **Confirmation (7 tests)** - Order confirmation display, navigation guards, cart clearing, voucher persistence
- **Filters (20 tests)** - Search, category filtering, sorting, filter combinations, persistence

**API Tests (17 tests)**
- **Deals API (3 tests)** - GET /deals response structure, expired deal validation, sold-out deal validation
- **Checkout API (14 tests)** - Auth (3), validation (5), business logic (3), vouchers (2), security (1)

### Lambda Bug Fixes
- **Email validation vulnerability** - Discovered through API testing; Lambda was accepting malformed email strings (e.g., "not-an-email"). Added regex validation to prevent bad data from reaching DynamoDB.

---

## Roadmap

### Current Sprint (Next Up)
- **Order Management**
  - Order history page with status tracking (Active, Redeemed, Expired, Failed, Refunded, Gifted)
  - Order redemption functionality
  - Gifting flows (checkout gift option + post-purchase transfer)

### Next Sprint
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