import { test, expect } from '@playwright/test'
import { getApiToken } from './helpers/getApiToken'

test.describe('Checkout API tests', () => {
    let tokenValue

    test.beforeAll( () => {
        tokenValue = getApiToken()
    })

    test('Valid order creation returns 201 @api @checkout @smoke', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: process.env.TEST_USER_EMAIL
            }
        })
        
        expect(response.status()).toBe(201)
        
        const data = await response.json()
        expect(data).toHaveProperty('message')
        expect(data).toHaveProperty('order')
        expect(data.message).toBe('Order created successfully')
        expect(data.order.orderId).toBeDefined()
        expect(data.order.purchasedBy).toBeDefined()
        expect(data.order.vouchers).toBeDefined()
        expect(data.order.status).toBeDefined()
    })

    test('POST /orders with invalid token returns 401/403 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
            'Authorization': 'Bearer invalid.token.here'
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'Test User',
                customerEmail: 'test@example.com',
            }
        })

        expect([401, 403]).toContain(response.status())
        const data = await response.json()
        expect(data).toHaveProperty('message')
    })

    test('POST /orders with missing authorization header returns 401 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'Test User',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(401)
        const data = await response.json()
        expect(data).toHaveProperty('message')
    })

    test('POST /orders with empty items array returns 400 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [],
                customerName: 'Test User',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Items array is required and must not be empty')
    })
    
    test('POST /orders with missing customer name returns 400 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: '',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('customerEmail and customerName are required')
    })

    test('POST /orders with missing customer email returns 400 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: '',
            }
        })
    
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('customerEmail and customerName are required')
    })

    test('POST /orders with invalid customer email returns 400 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'not-an-email',
            }
        })
    
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Invalid email format')
    })

    test('POST /orders with invalid quantity returns 400 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 0 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Each item must have dealId and quantity > 0')
    })

    test('POST /orders with non-existent deal returns 404 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-999', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(404)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Deal not found: deal-999')
    })

    test('POST /orders with expired deal returns 410 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-005', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(410)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Deal expired: Escape Room Experience - 2 Players')
    })

     test('POST /orders with sold out deal returns 409 @api @checkout', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-004', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
            }
        })
    
        expect(response.status()).toBe(409)
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Insufficient stock for: Premium Car Wash & Detail')
    })

    test('POST /orders with valid voucher applies discount @api @checkout @voucher', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
                voucherCode: 'WELCOME10'
            }
        })

        expect(response.status()).toBe(201)
        const data = await response.json()
        expect(data).toHaveProperty('message')
        expect(data).toHaveProperty('order')
        expect(data.order.discount).toBe(3.5) 
        expect(data.order.voucherCode).toBe('WELCOME10')
    })

    test('POST /orders without voucher has no discount @api @checkout @voucher', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com'
            }
        })

        expect(response.status()).toBe(201)
        const data = await response.json()
        expect(data).toHaveProperty('message')
        expect(data).toHaveProperty('order')
        expect(data.order.discount).toBe(0)
        expect(data.order.voucherCode).toBeNull()
    })
    
     test('POST /orders with valid voucher but with an incorrect token returns 401 @api @checkout @security', async ({request}) => {
        const response = await request.post(`${process.env.API_BASE_URL}/orders`, {
            headers: {
                'Authorization': `invaild`,
            },
            data: {
                items: [{ dealId: 'deal-003', quantity: 1 }],
                customerName: 'test test',
                customerEmail: 'test@example.com',
                voucherCode: 'WELCOME10'
            }
        })

        expect([401, 403]).toContain(response.status())
        const data = await response.json()
        expect(data).toHaveProperty('message')
    })
    
})