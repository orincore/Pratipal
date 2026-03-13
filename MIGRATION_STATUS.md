# MongoDB Migration Status

## ✅ Completed Work

### 1. Infrastructure Setup
- ✅ Installed `mongoose` and `mongodb` packages
- ✅ Created MongoDB connection handler (`src/lib/mongodb.ts`)
- ✅ Created database service layer (`src/lib/db.ts`)
- ✅ Updated auth utilities to remove Supabase dependency

### 2. Mongoose Models Created (11 models)
All models include:
- Proper TypeScript interfaces
- Timestamps (created_at, updated_at)
- toJSON transforms to convert _id to id
- Appropriate indexes

**Models:**
1. ✅ `src/models/AuthUser.ts` - Admin users
2. ✅ `src/models/Customer.ts` - Customer accounts
3. ✅ `src/models/CustomerAddress.ts` - Shipping/billing addresses
4. ✅ `src/models/Category.ts` - Product categories
5. ✅ `src/models/Product.ts` - Products with full schema
6. ✅ `src/models/Order.ts` - Orders with tracking support
7. ✅ `src/models/OrderItem.ts` - Order line items
8. ✅ `src/models/CartItem.ts` - Shopping cart
9. ✅ `src/models/LandingPage.ts` - Dynamic landing pages
10. ✅ `src/models/Media.ts` - Uploaded media files
11. ✅ `src/models/InvitationRequest.ts` - Landing page invitations

### 3. API Routes Migrated (9 routes)

#### Authentication Routes (5/7)
- ✅ `/api/auth/login` - Admin login with MongoDB
- ✅ `/api/auth/register` - Customer registration
- ✅ `/api/auth/customer-login` - Customer login
- ✅ `/api/auth/customer-me` - Get customer profile
- ✅ `/api/auth/me` - Get admin profile (no DB needed)

#### Core Routes (4)
- ✅ `/api/categories` - GET and POST with MongoDB
- ✅ `/api/products` - GET and POST with category population
- ✅ `/api/orders` - GET and POST with order items
- ✅ `/api/cart` - GET and POST with product population
- ✅ `/api/landing-pages` - GET and POST

### 4. Documentation & Tools
- ✅ Created `MONGODB_MIGRATION.md` - Complete migration guide
- ✅ Created `.env.local.example` - Environment variable template
- ✅ Created `scripts/migrate-supabase-to-mongodb.ts` - Data migration script

## 🔄 Remaining Work

### API Routes to Migrate (~27 routes)

#### Product Routes (3)
- [ ] `/api/products/[id]` - GET, PATCH, DELETE
- [ ] `/api/products/slug/[slug]` - GET by slug

#### Order Routes (3)
- [ ] `/api/orders/[id]` - GET, PATCH
- [ ] `/api/admin/orders` - GET all orders
- [ ] `/api/admin/orders/[id]` - PATCH order status

#### Cart Routes (3)
- [ ] `/api/cart/[id]` - PATCH, DELETE
- [ ] `/api/cart/calculate-shipping` - Calculate shipping cost

#### Landing Page Routes (2)
- [ ] `/api/landing-pages/[id]` - GET, PATCH, DELETE
- [ ] `/api/landing-pages/[id]/duplicate` - Duplicate page

#### Account Routes (4)
- [ ] `/api/account/addresses` - GET, POST
- [ ] `/api/account/addresses/[id]` - PATCH, DELETE
- [ ] `/api/account/profile` - GET, PATCH

#### Other Routes (12)
- [ ] `/api/auth/logout` - Clear admin session
- [ ] `/api/auth/customer-logout` - Clear customer session
- [ ] `/api/auth/seed` - Seed admin user
- [ ] `/api/invitations` - POST invitation request
- [ ] `/api/upload` - Media upload
- [ ] `/api/hero-sections` - GET hero sections
- [ ] `/api/admin/hero-sections` - GET, POST
- [ ] `/api/admin/hero-sections/[id]` - PATCH, DELETE
- [ ] `/api/admin/shipping-settings` - GET, PATCH
- [ ] `/api/sessions/*` - Session booking routes (3 routes)
- [ ] `/api/razorpay/*` - Payment routes (2 routes)

## 📋 Next Steps

### Step 1: Set Up MongoDB
```bash
# Option A: Local MongoDB
brew install mongodb-community
brew services start mongodb-community

# Option B: MongoDB Atlas (Cloud)
# Sign up at https://www.mongodb.com/cloud/atlas
# Create a cluster and get connection string
```

### Step 2: Update Environment Variables
```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and add:
MONGODB_URI=mongodb://localhost:27017/pratipal
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pratipal

# Keep existing JWT secret
AUTH_JWT_SECRET=your-existing-secret
JWT_SECRET=your-existing-secret
```

### Step 3: Migrate Remaining API Routes
The remaining routes follow the same pattern:
1. Replace `getServiceSupabase()` with `getDB()`
2. Replace Supabase queries with Mongoose queries
3. Handle _id to id conversion
4. Use `.lean()` for read operations
5. Use `.populate()` for relationships

### Step 4: Run Data Migration
```bash
# Install ts-node if not already installed
npm install -D ts-node dotenv

# Run migration script
npx ts-node scripts/migrate-supabase-to-mongodb.ts
```

### Step 5: Test Application
```bash
# Start development server
npm run dev

# Test critical flows:
# - Admin login
# - Customer registration/login
# - Product browsing
# - Add to cart
# - Checkout
# - Order management
# - Landing page rendering
```

### Step 6: Remove Supabase Dependencies
```bash
# After confirming everything works:
npm uninstall @supabase/ssr @supabase/supabase-js

# Remove from .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# - SUPABASE_SECRET_KEY

# Delete Supabase files:
# - src/lib/supabase/server.ts
# - src/lib/supabase/client.ts
# - src/lib/supabase/auth-context.tsx (if not using)
```

## 🔍 Key Migration Patterns

### Query Pattern
```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .single();

// After (MongoDB)
const { Product } = await getDB();
const product = await Product.findOne({ is_active: true }).lean();
```

### Insert Pattern
```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'Product' })
  .select()
  .single();

// After (MongoDB)
const { Product } = await getDB();
const product = await Product.create({ name: 'Product' });
```

### Update Pattern
```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('products')
  .update({ name: 'New Name' })
  .eq('id', productId)
  .select()
  .single();

// After (MongoDB)
const { Product } = await getDB();
const product = await Product.findByIdAndUpdate(
  productId,
  { name: 'New Name' },
  { new: true }
).lean();
```

### Delete Pattern
```typescript
// Before (Supabase)
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);

// After (MongoDB)
const { Product } = await getDB();
await Product.findByIdAndDelete(productId);
```

### Relationship/Join Pattern
```typescript
// Before (Supabase)
const { data } = await supabase
  .from('products')
  .select('*, category:categories(id, name)')
  .eq('id', productId)
  .single();

// After (MongoDB)
const { Product } = await getDB();
const product = await Product.findById(productId)
  .populate('category_id', 'id name')
  .lean();
```

## ⚠️ Important Notes

1. **ID Handling**: MongoDB uses ObjectId, but we convert to string in toJSON
2. **Lean Queries**: Always use `.lean()` for read operations to get plain objects
3. **Population**: Use `.populate()` instead of Supabase joins
4. **Transactions**: Use MongoDB transactions for multi-document operations
5. **Indexes**: Already created in models for performance
6. **Validation**: Mongoose handles validation automatically

## 📊 Migration Progress

**Overall Progress: ~35% Complete**
- ✅ Infrastructure: 100%
- ✅ Models: 100%
- ✅ Core API Routes: 35% (9/36 routes)
- ⏳ Remaining Routes: 65%
- ⏳ Testing: 0%
- ⏳ Cleanup: 0%

## 🎯 Estimated Time to Complete

- Remaining API routes: 2-3 hours
- Data migration: 30 minutes
- Testing: 1-2 hours
- Cleanup: 30 minutes

**Total: 4-6 hours**
