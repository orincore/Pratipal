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
new fix keys chsngee create by claw anon -> publishable 1:20
better error handling and more to cmd line debug  1:35
build version fix creating check point --  1:43 rx0w@#
admin feetch to dynamic hero and remove old claw work's admin hero and features section  : 1:53
fix the db schemas to workproperly with the admin dynamycs products and routes on landing page : 2:08
fix the change razor pay processing and clawd crafted cart fix  : 2:30 
new minimal and look of booking section : 2:46
theme set to grident fucking peacook color in all ui component : 2:50 
header and all thing changes as per landing page cleaning up the code and format it  :  3:10
today final checkpoint : 3:10 rx0w/xc/br  [good night]
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

## query to fix rls of hero section 
 `-- Enable Row Level Security on hero_sections
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active hero sections" ON hero_sections;
DROP POLICY IF EXISTS "Service role can manage hero sections" ON hero_sections;

-- Create policy to allow anyone to view active hero sections
CREATE POLICY "Anyone can view active hero sections"
  ON hero_sections FOR SELECT
  USING (is_active = true);

-- Create policy for service role to manage all hero sections
CREATE POLICY "Service role can manage hero sections"
  ON hero_sections FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
`