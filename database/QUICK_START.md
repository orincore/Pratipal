# Database Quick Start

## 🎯 Goal
Set up your Pratipal database in 2 minutes using CLI commands.

## ✅ Prerequisites
- Node.js installed
- `.env` file with Supabase credentials

## 🚀 Setup (Choose One Method)

### Method 1: NPM Script (Easiest)
```bash
cd Pratipal
npm run db:setup
```

### Method 2: Direct Node Script
```bash
cd Pratipal/database/scripts
node setup.js
```

### Method 3: PowerShell (Windows)
```powershell
cd Pratipal/database/scripts
.\setup.ps1
```

### Method 4: Bash (Mac/Linux)
```bash
cd Pratipal/database/scripts
chmod +x setup.sh
./setup.sh
```

## 🔍 Verify Setup
```bash
npm run db:verify
```

## 📝 What Gets Created

**16 Tables:**
- ✓ products, categories, product_variants
- ✓ orders, order_items
- ✓ customers, customer_addresses
- ✓ cart_items
- ✓ landing_pages, media, invitation_requests
- ✓ auth_users
- ✓ shipping_settings
- ✓ hero_sections (with 3 defaults)
- ✓ session_bookings
- ℹ️ product_reviews, wishlist_items, coupons (optional)

## ⚡ Quick Commands

```bash
# Setup database
npm run db:setup

# Verify setup
npm run db:verify

# Run specific migration
cd database/migrations
psql $DATABASE_URL -f 003_hero_sections.sql
```

## 🆘 Troubleshooting

**"Cannot find module"**
```bash
cd Pratipal
npm install
```

**"Missing credentials"**
- Check `.env` file exists
- Verify Supabase URL and keys are correct

**"psql not found"**
- Script will use HTTP API automatically
- Or install PostgreSQL client

## 📚 More Info
See [database/README.md](./README.md) for detailed documentation.
