# Database Setup Checklist

## Hero Sections Table

### Setup Steps
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy content from `hero-section-schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify with: `SELECT * FROM hero_sections;`
- [ ] Check admin page: `/admin/hero-sections`

### Expected Result
✓ Table `hero_sections` created
✓ 3 default hero sections inserted
✓ Admin page shows 3 sections
✓ Can create/edit/delete sections

## Other Tables Status

### Session Bookings
- [ ] Table: `session_bookings` (check `session-bookings-schema.sql`)
- [ ] API: `/api/sessions/*`
- [ ] Page: `/book-session`

### Products
✓ Already set up

### Orders
✓ Already set up

### Shipping Settings
✓ Already set up

## Quick Verification Commands

```sql
-- Check if hero_sections exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'hero_sections'
);

-- Count hero sections
SELECT COUNT(*) FROM hero_sections;

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
