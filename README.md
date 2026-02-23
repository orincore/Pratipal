# Pratipal Store

## Quick Start
```bash
npm install
npm run dev
```

## Database Setup
Run SQL files in Supabase SQL Editor (in order):
1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_shipping_settings.sql`
3. `database/migrations/003_hero_sections.sql`
4. `database/migrations/004_session_bookings.sql`

## Environment
Copy `.env.example` to `.env` and add:
- Supabase URL & Keys
- Razorpay Keys (for payments)

## Key Features
- Product catalog with variants
- Session booking with Razorpay payment
- Dynamic hero sections (admin managed)
- Weight-based shipping calculator
- Customer accounts & order tracking
- Landing page builder

## Admin Access
`/admin` - Manage products, orders, hero sections, shipping settings

## URLs
- Storefront: `/`
- Shop: `/shop`
- Book Session: `/book-session`
- Admin: `/admin`
- Custom Landing Pages: `/{slug}`  
