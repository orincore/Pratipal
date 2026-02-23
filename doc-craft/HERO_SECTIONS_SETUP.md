# Hero Sections Database Setup

## Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema
1. Copy the entire content from `hero-section-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify
Check that the table was created:
```sql
SELECT * FROM hero_sections;
```

You should see 3 default hero sections.

## What Gets Created

**Table:** `hero_sections`
- Stores carousel slides with images, text, and CTAs
- Includes 3 pre-populated default slides

**Index:** `idx_hero_sections_active_order`
- Optimizes queries for active sections

**Trigger:** `hero_sections_updated_at`
- Auto-updates `updated_at` timestamp on changes

## Default Hero Sections

1. **Main Hero** - "EVERY MOMENT PRATIPAL"
2. **Essential Oils** - Healing oil roll-ons
3. **Intention Salts** - Crystal-infused bath salts

## Troubleshooting

**Error: relation already exists**
- Table already created, you're good!

**Error: permission denied**
- Make sure you're logged in as the project owner

**No data showing in admin**
- Check if the INSERT statements ran successfully
- Verify `is_active` is true

## Next Steps

After running the SQL:
1. Go to `/admin/hero-sections`
2. You should see 3 default sections
3. Edit, add, or remove as needed
