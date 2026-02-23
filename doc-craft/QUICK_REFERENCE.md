# 🚀 Pratipal - Quick Reference Card

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run database migrations
# Execute SQL files in Supabase:
# - supabase-shipping-settings.sql
# - session-bookings-schema.sql

# 4. Start development server
npm run dev

# 5. Open browser
http://localhost:3000
```

## 🔑 Critical Configuration

### 1. WhatsApp Number
**File**: `src/app/(storefront)/book-session/page.tsx`
**Line**: 138
**Change**: `const whatsappNumber = "919876543210";`

### 2. Shipping Rates
**Location**: Admin Panel → Shipping Settings
**Defaults**: ₹50/kg, Free shipping at ₹500

### 3. Admin Login
**URL**: `/admin/login`
**Create user**: Run seed API or insert into `admins` table

## 📍 Important URLs

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Landing page |
| Shop | `/shop` | Product catalog |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Order checkout |
| Book Session | `/book-session` | Session booking |
| Admin | `/admin` | Admin panel |
| Admin Login | `/admin/login` | Admin authentication |

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm run lint         # Run linter
npx tsc --noEmit     # Check TypeScript

# Database
# Run in Supabase SQL Editor
```

## 🐛 Quick Fixes

### Cart items disappearing?
✅ Already fixed - React key issue resolved

### Shipping not calculating?
1. Check shipping_settings table exists
2. Verify products have weight values
3. Check API: `/api/cart/calculate-shipping`

### Payment not working?
1. Verify Razorpay keys in `.env`
2. Check keys are correct (test vs live)
3. Ensure Razorpay script loads

### Emails not sending?
1. Check SMTP credentials
2. Use Gmail app password (not regular password)
3. Verify port 587 is open

## 📊 Database Tables

Essential tables:
- `products` - Product catalog
- `cart_items` - Shopping cart
- `orders` - Order history
- `session_bookings` - Session bookings
- `shipping_settings` - Shipping config
- `customers` - Customer accounts
- `admins` - Admin users

## 🎨 Design Tokens

### Colors
- Purple: `#8B7FC8`
- Blue: `#7B9FC7`
- Teal: `#5EBDC5`
- Green: `#3DC1AB`

### Gradients
```css
/* Brand gradient */
from-purple-500 via-blue-500 to-teal-500

/* Service cards */
from-purple-500 to-pink-500
from-blue-500 to-teal-500
from-green-500 to-emerald-500
```

## 📱 Test Checklist

Quick test before launch:
- [ ] Homepage loads
- [ ] Add product to cart
- [ ] Cart persists
- [ ] Checkout works
- [ ] Payment completes
- [ ] Book session works
- [ ] Admin login works
- [ ] Emails send

## 🔐 Environment Variables

```env
# Minimum required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_USER=
SMTP_PASSWORD=
```

## 📞 Support Contacts

**Email**: hello@pratipal.in
**Phone**: +91 98765 43210
**WhatsApp**: 919876543210

## 🚨 Emergency Fixes

### Site down?
1. Check server logs
2. Verify database connection
3. Check environment variables
4. Restart server

### Orders not processing?
1. Check Razorpay dashboard
2. Verify webhook configuration
3. Check order status in database
4. Review error logs

### Admin can't login?
1. Verify admin user exists in database
2. Check password hash
3. Clear browser cookies
4. Try password reset

## 📈 Monitoring

Check these regularly:
- Error logs (browser console)
- Server logs (terminal)
- Supabase dashboard
- Razorpay dashboard
- Email delivery status

## 🎯 Key Features

✅ Modern landing page
✅ Product catalog
✅ Shopping cart
✅ Weight-based shipping
✅ Razorpay payments
✅ Session booking
✅ WhatsApp integration
✅ Email notifications
✅ Admin panel
✅ Order management

## 📚 Documentation

Full docs available:
- `FINAL_SETUP_CHECKLIST.md` - Complete setup
- `BACKEND_TEST_GUIDE.md` - Testing guide
- `DEPLOYMENT_READY_SUMMARY.md` - Full summary
- `SHIPPING_SETUP_GUIDE.md` - Shipping config
- `CART_CHECKOUT_FIXES.md` - Cart fixes

## ⚡ Performance Tips

- Images optimized via Next.js Image
- Code splitting automatic
- Lazy loading enabled
- Bundle size optimized
- Caching configured

## 🔄 Update Checklist

Before each deployment:
- [ ] Run `npm run build`
- [ ] Test critical paths
- [ ] Check error logs
- [ ] Verify environment variables
- [ ] Backup database
- [ ] Update documentation

---

**Status**: 🟢 All Systems Operational
**Version**: 1.0.0
**Build**: ✅ Successful
**Errors**: ❌ None
