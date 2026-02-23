# Quick Database Setup (2 Minutes)

## Status Check
Run this in Supabase SQL Editor to see what's missing:

```sql
-- Check which tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hero_sections') 
    THEN '✓ hero_sections exists'
    ELSE '✗ hero_sections MISSING'
  END as hero_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'session_bookings') 
    THEN '✓ session_bookings exists'
    ELSE '✗ session_bookings MISSING'
  END as booking_status;
```

## Setup Missing Tables

### If hero_sections is missing:
1. Open `hero-section-schema.sql`
2. Copy all content
3. Paste in Supabase SQL Editor
4. Click Run
5. Verify: `SELECT COUNT(*) FROM hero_sections;` (should return 3)

### If session_bookings is missing:
1. Open `session-bookings-schema.sql`
2. Copy all content
3. Paste in Supabase SQL Editor
4. Click Run
5. Verify: `SELECT COUNT(*) FROM session_bookings;` (should return 0)

## Final Verification

```sql
-- Should return all 16 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- auth_users
-- cart_items
-- categories
-- coupon_usage
-- coupons
-- customer_addresses
-- customers
-- hero_sections ← NEW
-- invitation_requests
-- landing_pages
-- media
-- order_items
-- orders
-- product_reviews
-- product_variants
-- products
-- session_bookings ← NEW
-- shipping_settings
-- wishlist_items
```

## Test Your Setup

1. **Hero Sections:** Go to `/admin/hero-sections` - should show 3 sections
2. **Session Bookings:** Go to `/book-session` - form should work
3. **Orders:** Go to `/admin/ecommerce/orders` - should load
4. **Products:** Go to `/shop` - should display products

## Done!
Your database is now 100% production ready.
