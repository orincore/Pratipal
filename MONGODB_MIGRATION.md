# MongoDB Migration Guide

## Migration Status

### ✅ Completed
1. **MongoDB Setup**
   - Installed `mongoose` and `mongodb` packages
   - Created MongoDB connection handler (`src/lib/mongodb.ts`)
   - Created database service layer (`src/lib/db.ts`)

2. **Mongoose Models Created**
   - `src/models/LandingPage.ts`
   - `src/models/Media.ts`
   - `src/models/AuthUser.ts`
   - `src/models/Customer.ts`
   - `src/models/CustomerAddress.ts`
   - `src/models/Category.ts`
   - `src/models/Product.ts`
   - `src/models/Order.ts`
   - `src/models/OrderItem.ts`
   - `src/models/CartItem.ts`
   - `src/models/InvitationRequest.ts`

3. **Auth Utilities Updated**
   - Removed `getServiceSupabase()` from `src/lib/auth.ts`
   - Auth now works independently with MongoDB

4. **API Routes Migrated**
   - ✅ `/api/auth/login` - Admin login
   - ✅ `/api/auth/register` - Customer registration
   - ✅ `/api/auth/customer-login` - Customer login
   - ✅ `/api/auth/customer-me` - Get customer profile
   - ✅ `/api/auth/me` - Get admin profile (no DB needed)
   - ✅ `/api/categories` - GET and POST

### 🔄 In Progress
- Migrating remaining API routes (products, orders, cart, landing pages, etc.)

### ⏳ Pending
- Complete all API route migrations
- Update environment variables
- Remove Supabase dependencies
- Create data migration script
- Testing

## Environment Variables Required

Add to `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pratipal
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pratipal?retryWrites=true&w=majority

# Keep existing variables
AUTH_JWT_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_URL=<can be removed after migration>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<can be removed after migration>
SUPABASE_SECRET_KEY=<can be removed after migration>
```

## API Routes to Migrate

### Auth Routes (5/7 completed)
- [x] `/api/auth/login`
- [x] `/api/auth/register`
- [x] `/api/auth/customer-login`
- [x] `/api/auth/customer-me`
- [x] `/api/auth/me`
- [ ] `/api/auth/logout`
- [ ] `/api/auth/customer-logout`
- [ ] `/api/auth/seed`

### Product & Category Routes
- [x] `/api/categories` (GET, POST)
- [ ] `/api/products` (GET, POST)
- [ ] `/api/products/[id]` (GET, PATCH, DELETE)
- [ ] `/api/products/slug/[slug]`

### Order Routes
- [ ] `/api/orders` (GET, POST)
- [ ] `/api/orders/[id]` (GET, PATCH)
- [ ] `/api/admin/orders` (GET)
- [ ] `/api/admin/orders/[id]` (PATCH)

### Cart Routes
- [ ] `/api/cart` (GET, POST)
- [ ] `/api/cart/[id]` (PATCH, DELETE)
- [ ] `/api/cart/calculate-shipping`

### Landing Page Routes
- [ ] `/api/landing-pages` (GET, POST)
- [ ] `/api/landing-pages/[id]` (GET, PATCH, DELETE)
- [ ] `/api/landing-pages/[id]/duplicate`

### Other Routes
- [ ] `/api/account/addresses` (GET, POST)
- [ ] `/api/account/addresses/[id]` (PATCH, DELETE)
- [ ] `/api/account/profile` (GET, PATCH)
- [ ] `/api/invitations` (POST)
- [ ] `/api/upload`
- [ ] `/api/hero-sections`
- [ ] `/api/admin/hero-sections`
- [ ] `/api/admin/shipping-settings`
- [ ] `/api/sessions/*` (session booking routes)
- [ ] `/api/razorpay/*` (payment routes)

## Key Differences: Supabase vs MongoDB

### Query Syntax
```typescript
// Supabase
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .single();

// MongoDB/Mongoose
const { Product } = await getDB();
const product = await Product.findOne({ is_active: true }).lean();
```

### ID Handling
- Supabase uses UUID strings
- MongoDB uses ObjectId (converted to string in toJSON)
- Always use `.lean()` for read operations to get plain objects
- Use `_id.toString()` or rely on toJSON transform

### Relationships
```typescript
// Supabase (automatic joins)
.select('*, category:categories(id, name)')

// MongoDB (manual population)
.populate('category_id', 'name slug')
// OR use aggregation pipeline
```

## Data Migration Script

See `scripts/migrate-supabase-to-mongodb.ts` for the complete data migration script.

## Testing Checklist

After migration, test:
- [ ] Admin login
- [ ] Customer registration and login
- [ ] Product listing and search
- [ ] Category management
- [ ] Cart operations
- [ ] Order creation
- [ ] Order tracking
- [ ] Landing page rendering
- [ ] Media uploads
- [ ] Payment flows (Razorpay)

## Rollback Plan

If issues occur:
1. Keep Supabase credentials in `.env.local`
2. Git revert to previous commit
3. Restore Supabase dependencies in `package.json`
4. Run `npm install`

## Notes

- All models use timestamps with `created_at` and `updated_at`
- Models include `toJSON` transform to convert `_id` to `id`
- Indexes are created on frequently queried fields
- Connection pooling handled by Mongoose automatically
