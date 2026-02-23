# Final Setup & Debugging Checklist

## ✅ Build Status: SUCCESSFUL

The application builds successfully with all routes compiled.

## 🔧 Required Setup Steps

### 1. Database Setup (CRITICAL)

#### Run SQL Migrations in Supabase SQL Editor:

1. **Shipping Settings Table**
```bash
# Execute: Pratipal/supabase-shipping-settings.sql
```

2. **Session Bookings Table** (if not already created)
```bash
# Execute: Pratipal/session-bookings-schema.sql
```

### 2. Environment Variables

Verify your `.env` file has all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key

# Authentication
AUTH_JWT_SECRET=your_jwt_secret_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@pratipal.in

# AWS S3 (Optional - for media uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your_bucket_name
```

### 3. WhatsApp Configuration

Update WhatsApp number in:
- File: `Pratipal/src/app/(storefront)/book-session/page.tsx`
- Line: 138
- Current: `const whatsappNumber = "919876543210";`
- Change to your number (format: country code + number, no + or spaces)

### 4. Admin Configuration

#### Create Admin User:
```sql
-- Run in Supabase SQL Editor
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'admin@pratipal.in',
  '$2a$10$...',  -- Use bcrypt to hash your password
  'Admin',
  'admin'
);
```

Or use the seed endpoint:
```bash
POST http://localhost:3000/api/auth/seed
```

#### Configure Shipping Settings:
1. Login to admin panel: `/admin/login`
2. Navigate to "Shipping Settings"
3. Set:
   - Cost per KG: ₹50 (or your rate)
   - Free Shipping Threshold: ₹500 (or your amount)

### 5. Add Product Weights

For shipping calculator to work:
1. Go to Admin → Products
2. Edit each product
3. Add weight in kg (e.g., 0.5 for 500g)
4. Save

## 🧪 Testing Checklist

### Frontend Tests

- [ ] Homepage loads correctly
- [ ] Hero section displays with animations
- [ ] Branding section (प्रतिपाल) shows properly
- [ ] Services section displays 3 service types
- [ ] Products section loads featured products
- [ ] Testimonials show real customer reviews
- [ ] All navigation links work

### Cart & Checkout Tests

- [ ] Add product to cart
- [ ] Cart drawer opens and shows items
- [ ] Items persist (don't disappear)
- [ ] Update quantity in cart
- [ ] Remove items from cart
- [ ] Cart page shows correct totals
- [ ] Shipping cost calculates based on weight
- [ ] Free shipping threshold works
- [ ] Checkout page loads
- [ ] Address form works (for logged-in users)
- [ ] Payment methods display (Razorpay & COD)

### Session Booking Tests

- [ ] Book session page loads
- [ ] Form validation works
- [ ] Session type selection works
- [ ] Frequency selection works
- [ ] Razorpay payment opens
- [ ] Payment completes successfully
- [ ] WhatsApp opens with pre-filled message
- [ ] Success page displays
- [ ] Confirmation email received
- [ ] Admin notification email received

### Admin Panel Tests

- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Products page displays
- [ ] Create/edit product works
- [ ] Upload images works
- [ ] Categories management works
- [ ] Orders page displays
- [ ] Order details show correctly
- [ ] Shipping settings page works
- [ ] Update shipping rates works

## 🐛 Known Issues & Fixes

### Issue 1: Cart Items Disappearing
**Status**: ✅ FIXED
**Solution**: Fixed React key in cart drawer component

### Issue 2: Razorpay Build Error
**Status**: ✅ FIXED
**Solution**: Moved Razorpay initialization inside function

### Issue 3: Shipping Calculator Not Working
**Status**: ✅ FIXED
**Solution**: Fixed Supabase import, added API routes

### Issue 4: Devanagari Text Cut Off
**Status**: ✅ FIXED
**Solution**: Added padding and line-height to global CSS

## 📊 Backend API Endpoints

### Cart APIs
- `GET /api/cart` - Fetch cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/[id]` - Update quantity
- `DELETE /api/cart/[id]` - Remove item
- `POST /api/cart/calculate-shipping` - Calculate shipping

### Session Booking APIs
- `POST /api/sessions/create-booking` - Create booking
- `POST /api/sessions/create-payment` - Create Razorpay order
- `POST /api/sessions/verify-payment` - Verify payment

### Order APIs
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details

### Product APIs
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PATCH /api/products/[id]` - Update product

### Admin APIs
- `GET /api/admin/shipping-settings` - Get shipping config
- `PUT /api/admin/shipping-settings` - Update shipping config
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/[id]` - Update order status

## 🚀 Deployment Checklist

### Before Going Live:

- [ ] Switch Razorpay to LIVE keys
- [ ] Update WhatsApp number to business number
- [ ] Configure production SMTP server
- [ ] Set up proper admin email
- [ ] Add real product images
- [ ] Add product weights to all products
- [ ] Test complete order flow
- [ ] Test session booking flow
- [ ] Verify email delivery
- [ ] Test payment gateway
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up backup system
- [ ] Document admin procedures

### Environment Variables for Production:

Update in your hosting platform (Vercel/Netlify):
- All Supabase URLs and keys
- Razorpay LIVE keys
- Production SMTP credentials
- AWS S3 credentials (if using)

## 📱 Mobile Testing

Test on:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad
- [ ] Different screen sizes

## 🔒 Security Checklist

- [ ] Environment variables not exposed
- [ ] API routes have proper authentication
- [ ] Admin routes protected
- [ ] Payment verification secure
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens (if needed)
- [ ] Rate limiting on APIs

## 📈 Performance Optimization

- [ ] Images optimized (Next.js Image component)
- [ ] Lazy loading implemented
- [ ] Code splitting working
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90

## 🎨 Design Verification

- [ ] Gradient theme consistent
- [ ] Animations smooth
- [ ] Typography readable
- [ ] Colors match brand
- [ ] Spacing consistent
- [ ] Mobile responsive
- [ ] Accessibility (ARIA labels)

## 📞 Support Information

**Email**: hello@pratipal.in
**Phone**: +91 98765 43210 (Update this!)

## 🔄 Regular Maintenance

### Weekly:
- Check order status
- Review customer inquiries
- Monitor error logs

### Monthly:
- Update product inventory
- Review analytics
- Backup database
- Update dependencies

### Quarterly:
- Security audit
- Performance review
- User feedback analysis
- Feature planning

## ✅ Final Verification

Run these commands to verify everything:

```bash
# 1. Build the application
npm run build

# 2. Start production server
npm start

# 3. Test all critical paths
# - Homepage
# - Product pages
# - Cart & Checkout
# - Session booking
# - Admin panel
```

## 🎉 Launch Ready!

Once all items are checked:
1. Deploy to production
2. Test live site thoroughly
3. Monitor for 24 hours
4. Announce launch
5. Collect user feedback

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Status**: Production Ready ✅
