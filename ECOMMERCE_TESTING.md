# E-commerce System Testing Guide

## Quick Start Testing

### Step 1: Run Database Migrations
1. Open Supabase SQL Editor
2. Copy and paste the entire `supabase-schema.sql` file
3. Execute the SQL to create all tables and policies

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Create Sample Categories
1. Navigate to `/admin/ecommerce/products`
2. First, we need categories. Open your browser console and run:
```javascript
// Create sample categories via API
fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Candles',
    slug: 'candles',
    description: 'Aromatic candles for relaxation',
    is_active: true
  })
}).then(r => r.json()).then(console.log);

fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Roll-On',
    slug: 'rollon',
    description: 'Essential oil roll-ons',
    is_active: true
  })
}).then(r => r.json()).then(console.log);

fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Bath Salt',
    slug: 'salt',
    description: 'Relaxing bath salts',
    is_active: true
  })
}).then(r => r.json()).then(console.log);
```

### Step 4: Create Sample Products
1. Go to `/admin/ecommerce/products`
2. Click "Add Product"
3. Fill in the form:
   - Name: "Lavender Candle"
   - Slug: "lavender-candle"
   - Price: 299
   - SKU: "CAN-LAV-001"
   - Stock Quantity: 50
   - Category: Select "Candles"
   - Short Description: "Calming lavender scented candle"
   - Featured Image: Use any image URL or upload
   - Check "Active" and optionally "Featured"
4. Click "Create"
5. Repeat for more products

### Step 5: Test Storefront Integration
1. Navigate to your storefront homepage (e.g., `/`)
2. Verify products are displayed from the database
3. Check that product images, prices, and names are correct

### Step 6: Test Customer Registration
```javascript
// Register a test customer
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'Customer',
    phone: '+91 9876543210'
  })
}).then(r => r.json()).then(console.log);
```

### Step 7: Test Shopping Cart
```javascript
// Add item to cart
fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 'YOUR_PRODUCT_ID', // Get from products list
    quantity: 2
  })
}).then(r => r.json()).then(console.log);

// Get cart items
fetch('/api/cart')
  .then(r => r.json())
  .then(console.log);
```

### Step 8: Test Order Creation
```javascript
// Create an order
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    payment_method: 'cod',
    shipping_address: {
      first_name: 'Test',
      last_name: 'Customer',
      address_line1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
      phone: '+91 9876543210'
    },
    items: [
      {
        product_id: 'YOUR_PRODUCT_ID',
        quantity: 2
      }
    ]
  })
}).then(r => r.json()).then(console.log);
```

### Step 9: View Orders in Admin
1. Navigate to `/admin/ecommerce/orders`
2. You should see the test order
3. Click the eye icon to view order details

## Testing Checklist

### Product Management
- [ ] Create a new product
- [ ] Edit an existing product
- [ ] Delete a product
- [ ] Upload product image
- [ ] Set product as featured
- [ ] Mark product as inactive
- [ ] Update stock quantity
- [ ] Set sale price

### Category Management
- [ ] Create categories via API
- [ ] Products display under correct categories
- [ ] Filter products by category

### Customer Authentication
- [ ] Register new customer
- [ ] Login as customer
- [ ] View customer profile
- [ ] Logout

### Shopping Cart
- [ ] Add product to cart (guest)
- [ ] Add product to cart (logged in)
- [ ] Update cart item quantity
- [ ] Remove item from cart
- [ ] Cart persists across sessions
- [ ] Cart merges on login

### Checkout & Orders
- [ ] Create order as guest
- [ ] Create order as logged-in customer
- [ ] Order reduces stock quantity
- [ ] Order clears cart
- [ ] Order appears in customer's order history
- [ ] Order appears in admin panel

### Admin Features
- [ ] View all products
- [ ] Search products
- [ ] View all orders
- [ ] Search orders
- [ ] View order details
- [ ] Update order status

## Common Issues & Solutions

### Issue: Products not showing on storefront
**Solution:**
- Check that products are marked as `is_active = true`
- Verify the API endpoint `/api/products` returns data
- Check browser console for errors
- Verify Supabase RLS policies allow public read access

### Issue: Cart not persisting
**Solution:**
- Check browser cookies are enabled
- Verify `cart_session` cookie is being set
- Check the `/api/cart` endpoint response
- Ensure RLS policies allow cart operations

### Issue: Order creation fails
**Solution:**
- Verify product stock is available
- Check all required fields are provided
- Review order validation in `/api/orders/route.ts`
- Check Supabase logs for constraint violations

### Issue: Authentication errors
**Solution:**
- Verify JWT_SECRET is set in environment variables
- Check cookie settings (httpOnly, secure, sameSite)
- Ensure customer exists in database
- Verify password hash matches

## Performance Testing

### Load Testing Products
```javascript
// Fetch 100 products
console.time('products');
fetch('/api/products?limit=100')
  .then(r => r.json())
  .then(data => {
    console.timeEnd('products');
    console.log(`Loaded ${data.products.length} products`);
  });
```

### Test Cart Operations
```javascript
// Add multiple items quickly
const productIds = ['id1', 'id2', 'id3'];
Promise.all(
  productIds.map(id => 
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, quantity: 1 })
    })
  )
).then(() => console.log('All items added'));
```

## Security Testing

### Test Authentication
- [ ] Try accessing admin endpoints without auth
- [ ] Try accessing other customer's orders
- [ ] Verify password is hashed in database
- [ ] Test JWT token expiration
- [ ] Verify HTTPS in production

### Test Authorization
- [ ] Customer cannot access admin APIs
- [ ] Guest cannot view customer orders
- [ ] Customer can only view their own data
- [ ] Admin can view all data

## Integration Testing

### Full E-commerce Flow
1. Browse products on storefront
2. Add 3 different products to cart
3. Register as new customer
4. Update cart quantities
5. Proceed to checkout
6. Fill in shipping address
7. Place order
8. Verify order confirmation
9. Check order in customer account
10. View order in admin panel
11. Update order status
12. Verify stock was reduced

## Next Steps After Testing

1. **Add Payment Integration**
   - Integrate Razorpay/Stripe
   - Update order payment status
   - Handle payment webhooks

2. **Email Notifications**
   - Order confirmation emails
   - Shipping notifications
   - Password reset emails

3. **Advanced Features**
   - Product reviews
   - Wishlist functionality
   - Coupon codes
   - Product search
   - Filters and sorting

4. **UI Enhancements**
   - Product detail pages
   - Cart page
   - Checkout flow UI
   - Customer account dashboard
   - Order tracking

5. **Performance Optimization**
   - Add caching
   - Optimize images
   - Implement pagination
   - Add search indexing

## Monitoring

### Database Queries
Monitor Supabase dashboard for:
- Slow queries
- Failed requests
- RLS policy violations
- Storage usage

### API Performance
Track:
- Response times
- Error rates
- Most used endpoints
- Peak traffic times

### Business Metrics
Monitor:
- Total orders
- Revenue
- Average order value
- Cart abandonment rate
- Popular products
- Stock levels
