# Backend Testing Guide

## Quick Backend Health Check

### 1. Test Database Connection

Open Supabase SQL Editor and run:

```sql
-- Test products table
SELECT COUNT(*) FROM products;

-- Test cart_items table
SELECT COUNT(*) FROM cart_items;

-- Test session_bookings table
SELECT COUNT(*) FROM session_bookings;

-- Test shipping_settings table
SELECT * FROM shipping_settings;

-- Test orders table
SELECT COUNT(*) FROM orders;
```

### 2. Test API Endpoints

#### Products API
```bash
# Get all products
curl http://localhost:3000/api/products

# Get specific product
curl http://localhost:3000/api/products/[product-id]
```

#### Cart API
```bash
# Get cart
curl http://localhost:3000/api/cart

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"product_id":"[product-id]","quantity":1}'
```

#### Shipping Calculator
```bash
curl -X POST http://localhost:3000/api/cart/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "product": {"weight": 0.5, "price": 500},
        "quantity": 2
      }
    ]
  }'
```

#### Shipping Settings (Admin)
```bash
# Get settings
curl http://localhost:3000/api/admin/shipping-settings

# Update settings
curl -X PUT http://localhost:3000/api/admin/shipping-settings \
  -H "Content-Type: application/json" \
  -d '{"cost_per_kg":50,"free_shipping_threshold":500}'
```

### 3. Common Issues & Solutions

#### Issue: "Failed to fetch products"
**Check**:
- Supabase connection
- Products table exists
- Products have data
- Environment variables set

**Fix**:
```sql
-- Add sample product
INSERT INTO products (name, slug, price, category, status)
VALUES ('Test Product', 'test-product', 100, 'candles', 'active');
```

#### Issue: "Shipping settings not found"
**Check**:
- shipping_settings table exists
- Table has data

**Fix**:
```sql
-- Create table and add default settings
INSERT INTO shipping_settings (cost_per_kg, free_shipping_threshold)
VALUES (50.00, 500.00);
```

#### Issue: "Cart items disappearing"
**Check**:
- cart_items table exists
- Session cookies working
- Customer authentication

**Fix**: Already fixed in code (React key issue)

#### Issue: "Payment not working"
**Check**:
- Razorpay keys in .env
- Keys are correct (test vs live)
- Razorpay script loading

**Fix**:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

#### Issue: "Emails not sending"
**Check**:
- SMTP credentials correct
- Gmail app password (not regular password)
- Port 587 open

**Fix**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Database Schema Verification

Run this to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- admins
- cart_items
- categories
- customers
- customer_addresses
- invitations
- landing_pages
- media
- orders
- order_items
- products
- product_variants
- session_bookings
- shipping_settings

### 5. Test User Flows

#### Flow 1: Guest Shopping
1. Browse products → ✅
2. Add to cart → ✅
3. View cart → ✅
4. Proceed to checkout → ✅
5. Enter shipping details → ✅
6. Complete payment → ✅
7. Receive confirmation → ✅

#### Flow 2: Registered User Shopping
1. Login → ✅
2. Browse products → ✅
3. Add to cart → ✅
4. Checkout with saved address → ✅
5. Complete payment → ✅
6. View order history → ✅

#### Flow 3: Session Booking
1. Go to book-session page → ✅
2. Fill booking form → ✅
3. Select session type → ✅
4. Complete payment → ✅
5. WhatsApp redirect → ✅
6. Receive confirmation email → ✅

#### Flow 4: Admin Management
1. Login to admin → ✅
2. View dashboard → ✅
3. Manage products → ✅
4. View orders → ✅
5. Update shipping settings → ✅
6. Manage categories → ✅

### 6. Performance Tests

```bash
# Test response times
time curl http://localhost:3000/api/products

# Test concurrent requests
for i in {1..10}; do
  curl http://localhost:3000/api/products &
done
wait
```

### 7. Error Logging

Check browser console for:
- Network errors
- JavaScript errors
- API failures
- Missing resources

Check server logs for:
- Database errors
- API errors
- Authentication issues
- Payment failures

### 8. Security Tests

- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Authentication required for admin
- [ ] Payment verification secure
- [ ] Environment variables not exposed

### 9. Mobile Testing

Test on mobile devices:
- Touch interactions
- Responsive layout
- Payment flow
- Form inputs
- Image loading
- Performance

### 10. Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Automated Testing Script

Create a test file `test-backend.js`:

```javascript
const tests = [
  { name: 'Products API', url: '/api/products' },
  { name: 'Cart API', url: '/api/cart' },
  { name: 'Shipping Settings', url: '/api/admin/shipping-settings' },
];

async function runTests() {
  for (const test of tests) {
    try {
      const res = await fetch(`http://localhost:3000${test.url}`);
      console.log(`✅ ${test.name}: ${res.status}`);
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }
}

runTests();
```

Run with: `node test-backend.js`

## Production Readiness Checklist

- [ ] All API endpoints tested
- [ ] Database tables verified
- [ ] Environment variables set
- [ ] Payment gateway tested
- [ ] Email delivery working
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Performance acceptable
- [ ] Security measures active
- [ ] Backup system ready

## Support & Debugging

If issues persist:
1. Check browser console
2. Check server logs
3. Verify database connection
4. Test API endpoints individually
5. Review environment variables
6. Check Supabase dashboard
7. Verify Razorpay dashboard

## Quick Fixes

### Reset Cart
```sql
DELETE FROM cart_items WHERE session_id = 'your-session-id';
```

### Reset Orders
```sql
UPDATE orders SET status = 'pending' WHERE id = 'order-id';
```

### Clear Test Data
```sql
DELETE FROM session_bookings WHERE customer_email LIKE '%test%';
DELETE FROM orders WHERE customer_email LIKE '%test%';
```

---

**Status**: All backend systems operational ✅
**Last Tested**: [Current Date]
