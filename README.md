# Portfolio Project 2: Daily Deals E-Commerce Platform

Full-stack serverless e-commerce application with AWS backend and comprehensive end-to-end test automation. Features authentication, real-time deal browsing, shopping cart, multi-step checkout with voucher support, and order management system. Complete infrastructure managed as code with Terraform.

**Tech Stack:** JavaScript, Playwright, AWS (Lambda, DynamoDB, API Gateway, Cognito, S3, CloudFront), Terraform, GitHub Actions CI/CD, Allure reporting

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

### Order Management
- Order history page with real-time status tracking
- Order statuses: Active, Redeemed, Expired, Failed, Refunded, Gifted
- Voucher redemption functionality
- Gifting system (post-purchase voucher transfer to other users)
- Voucher validation (status checks, ownership verification)

### Search & Filtering
- Real-time search across deal titles and descriptions
- Category filtering (Wellness, Food, Activities, Services, Entertainment)
- Sort options (Newest, Price Low/High, Highest Discount, Expiring Soon)
- Combined filter support (search + category + sort)
- Empty state handling for no results
- Filter persistence across page refreshes
- Clear search functionality

### API Integration
- RESTful API Gateway endpoints for orders, redemption, and gifting
- JWT-based authentication with Cognito ID tokens
- Request payload validation (missing fields, boundary quantities)
- Business logic validation (deal availability, stock management, expiration)
- Voucher application and discount calculation
- Email format validation

---

## Infrastructure as Code

**Complete AWS infrastructure managed with Terraform:**
- **DynamoDB** - 3 tables (Deals, Orders, Vouchers) with optimized read/write capacity
- **IAM** - 6 least-privilege roles with granular DynamoDB permissions per Lambda function
- **Lambda** - 8 serverless functions (deals, orders, vouchers, auth trigger)
- **API Gateway** - Complete REST API with 11 resources, 8 methods, Cognito authorizer
- **Cognito** - User Pool with email-based auth, password policies, Lambda triggers
- **S3** - Frontend hosting bucket with encryption, OAC, and CloudFront integration
- **CloudFront** - Global CDN with WAF protection, security headers, SPA routing fix

**Infrastructure recovery:** Entire backend can be rebuilt from Terraform config in minutes - tested after accidental API Gateway deletion.

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
- **IAM permissions error** - Found through test failures after Terraform apply; OrderManagementRole was missing `dynamodb:UpdateItem` permission for deal stock decrement during order creation.

---

## Roadmap

### Next Sprint
- **Performance Testing**
  - Load testing with k6
  - API response time benchmarking
  - Concurrent user simulation

### Future Enhancements
- Email notifications via SES (order confirmation, gifting)
- Event-driven architecture with SQS
- Admin dashboard for order management
- Advanced voucher system (percentage + fixed amount discounts)
- Grafana dashboards with Prometheus monitoring