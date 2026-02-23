# Pratipal Database Management

Complete database setup and migration system for Pratipal e-commerce platform.

## 📁 Folder Structure

```
database/
├── migrations/          # SQL migration files (run in order)
│   ├── 000_run_all.sql # Master file (runs all migrations)
│   ├── 001_initial_schema.sql
│   ├── 002_shipping_settings.sql
│   ├── 003_hero_sections.sql
│   └── 004_session_bookings.sql
├── seeds/              # Sample data (future)
├── scripts/            # Setup automation scripts
│   ├── setup.js       # Node.js setup (cross-platform)
│   ├── setup.sh       # Bash setup (Mac/Linux/Git Bash)
│   ├── setup.ps1      # PowerShell setup (Windows)
│   └── verify.sql     # Verification queries
└── README.md          # This file
```

## 🚀 Quick Setup

### Option 1: Automated CLI Setup (Recommended)

**Prerequisites:**
- Node.js installed
- `.env` file with Supabase credentials

**Run:**
```bash
cd Pratipal/database/scripts
node setup.js
```

### Option 2: Manual SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_shipping_settings.sql`
   - `003_hero_sections.sql`
   - `004_session_bookings.sql`

### Option 3: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
cd Pratipal/database/migrations
supabase db push --file 001_initial_schema.sql
supabase db push --file 002_shipping_settings.sql
supabase db push --file 003_hero_sections.sql
supabase db push --file 004_session_bookings.sql
```

## 📋 Migration Details

### 001_initial_schema.sql
**Tables:** 14
- Products & Variants
- Orders & Order Items
- Customers & Addresses
- Cart Items
- Categories
- Landing Pages
- Media
- Invitation Requests
- Auth Users
- Product Reviews (optional)
- Wishlist (optional)
- Coupons (optional)

### 002_shipping_settings.sql
**Tables:** 1
- Shipping Settings (cost per kg, free shipping threshold)

### 003_hero_sections.sql
**Tables:** 1
- Hero Sections (homepage carousel)
- **Includes:** 3 default hero sections

### 004_session_bookings.sql
**Tables:** 1
- Session Bookings (healing session appointments)
- **Includes:** Payment integration fields

## ✅ Verification

### Quick Check
```bash
cd Pratipal/database/scripts
node verify.js
```

### Manual Check (SQL)
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 16 tables
-- auth_users, cart_items, categories, coupon_usage, coupons,
-- customer_addresses, customers, hero_sections, invitation_requests,
-- landing_pages, media, order_items, orders, product_reviews,
-- product_variants, products, session_bookings, shipping_settings,
-- wishlist_items
```

### Verify Counts
```sql
SELECT 'products' as table, COUNT(*) FROM products
UNION ALL SELECT 'hero_sections', COUNT(*) FROM hero_sections
UNION ALL SELECT 'session_bookings', COUNT(*) FROM session_bookings;
```

**Expected:**
- `hero_sections`: 3 rows (default data)
- `session_bookings`: 0 rows (empty until bookings)
- `products`: varies (your data)

## 🔧 Environment Setup

Create `.env` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_service_role_key
```

Get these from: [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

## 🛠️ Troubleshooting

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "psql not found"
Install PostgreSQL client:
- **Windows:** https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql-client`

### "Permission denied"
Make scripts executable:
```bash
chmod +x scripts/setup.sh
```

### "Table already exists"
Tables are created with `IF NOT EXISTS`, so re-running is safe.

## 📊 Database Schema Overview

### Core E-commerce (8 tables)
- Products, Categories, Variants
- Orders, Order Items
- Customers, Addresses
- Cart Items

### Content Management (3 tables)
- Landing Pages
- Media Library
- Invitation Requests

### Features (4 tables)
- Hero Sections (carousel)
- Session Bookings (appointments)
- Shipping Settings
- Auth Users

### Optional (4 tables)
- Product Reviews
- Wishlist
- Coupons & Usage

## 🔄 Adding New Migrations

1. Create new file: `005_your_feature.sql`
2. Add to `000_run_all.sql`
3. Update this README
4. Run setup script

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project README](../README.md)

## 🆘 Support

Issues? Check:
1. `.env` file exists and has correct credentials
2. Supabase project is active
3. Network connection is stable
4. Run verification script to see what's missing
