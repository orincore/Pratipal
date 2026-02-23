# Database Setup - Complete Guide

## ✅ What Was Done

### 1. Organized Database Files
All SQL files moved to proper structure:
```
Pratipal/database/
├── migrations/
│   ├── 000_run_all.sql (master file)
│   ├── 001_initial_schema.sql (14 tables)
│   ├── 002_shipping_settings.sql (1 table)
│   ├── 003_hero_sections.sql (1 table + 3 defaults)
│   └── 004_session_bookings.sql (1 table)
├── scripts/
│   ├── setup.js (Node.js - cross-platform)
│   ├── setup.sh (Bash - Mac/Linux)
│   ├── setup.ps1 (PowerShell - Windows)
│   └── verify.sql (verification queries)
├── seeds/ (for future sample data)
├── README.md (full documentation)
└── QUICK_START.md (2-minute guide)
```

### 2. Created CLI Setup Scripts
Three automated setup options:
- **setup.js** - Node.js (works everywhere)
- **setup.sh** - Bash (Mac/Linux/Git Bash)
- **setup.ps1** - PowerShell (Windows)

### 3. Added NPM Scripts
```json
{
  "db:setup": "node database/scripts/setup.js",
  "db:verify": "node database/scripts/verify.js",
  "db:migrate": "node database/scripts/setup.js"
}
```

## 🚀 How to Use

### Quick Setup (2 minutes)
```bash
cd Pratipal
npm run db:setup
```

That's it! The script will:
1. Check for Supabase CLI
2. Load your .env credentials
3. Run all 4 migrations in order
4. Verify setup

### Verify Setup
```bash
npm run db:verify
```

## 📋 What Gets Created

**Total: 16 Tables**

### Production Tables (14)
1. products
2. categories
3. product_variants
4. orders
5. order_items
6. customers
7. customer_addresses
8. cart_items
9. landing_pages
10. media
11. invitation_requests
12. auth_users
13. shipping_settings
14. hero_sections (NEW - with 3 defaults)
15. session_bookings (NEW)

### Optional Tables (4)
16. product_reviews
17. wishlist_items
18. coupons
19. coupon_usage

## 🎯 Benefits of CLI Setup

### Before (Manual)
- Open Supabase dashboard
- Copy/paste each SQL file
- Run one by one
- Check for errors manually
- ~10 minutes

### After (Automated)
- Run one command
- Automatic error handling
- Progress feedback
- Verification included
- ~2 minutes

## 🔧 Requirements

### Minimal
- Node.js (already installed for Next.js)
- `.env` file with Supabase credentials

### Optional (for advanced features)
- Supabase CLI (`npm install -g supabase`)
- PostgreSQL client (`psql`)

## 📖 Documentation Files

1. **database/README.md** - Complete documentation
2. **database/QUICK_START.md** - 2-minute setup guide
3. **DATABASE_AUDIT_REPORT.md** - Full table audit
4. **DATABASE_STATUS_SUMMARY.md** - Current status
5. **QUICK_DATABASE_SETUP.md** - Manual setup guide

## 🎉 Next Steps

1. **Run Setup:**
   ```bash
   cd Pratipal
   npm run db:setup
   ```

2. **Verify:**
   ```bash
   npm run db:verify
   ```

3. **Test Features:**
   - Visit `/admin/hero-sections` - should show 3 sections
   - Visit `/book-session` - booking form should work
   - Visit `/admin/ecommerce/orders` - should load
   - Visit `/shop` - products should display

## 🆘 Troubleshooting

### Script fails?
1. Check `.env` file exists
2. Verify Supabase credentials
3. Check network connection
4. Try manual setup (see QUICK_DATABASE_SETUP.md)

### Tables already exist?
- Safe to re-run (uses `IF NOT EXISTS`)
- Or skip to verification

### Need help?
- Check `database/README.md` for detailed docs
- Review error messages in console
- Verify `.env` credentials in Supabase dashboard

## ✨ Summary

You now have:
- ✅ Organized database structure
- ✅ Automated CLI setup
- ✅ Cross-platform scripts
- ✅ NPM commands for easy access
- ✅ Verification tools
- ✅ Complete documentation

**Time to production: 2 minutes** (just run `npm run db:setup`)
