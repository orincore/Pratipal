# E-commerce System Setup Guide

## Overview
A complete WooCommerce-style e-commerce system has been implemented with the following features:
- Product management (CRUD operations)
- User registration and authentication
- Shopping cart functionality
- Checkout and order processing
- Admin interface for managing products and orders
- Integration with existing storefront UI

## Database Schema

### Tables Created
1. **categories** - Product categories with hierarchical support
2. **products** - Main product catalog with pricing, inventory, and metadata
3. **product_variants** - Product variations (size, color, etc.)
4. **customers** - Customer accounts separate from admin users
5. **customer_addresses** - Shipping and billing addresses
6. **cart_items** - Shopping cart with session and customer support
7. **orders** - Order management with full lifecycle tracking
8. **order_items** - Individual items in each order
9. **product_reviews** - Customer product reviews
10. **wishlist_items** - Customer wishlists
11. **coupons** - Discount codes and promotions
12. **coupon_usage** - Coupon usage tracking

## Setup Instructions

### 1. Database Setup
Run the SQL schema in your Supabase SQL Editor:
```bash
# The schema is in: supabase-schema.sql
# Execute the entire file in Supabase SQL Editor
```

### 2. Install Dependencies
```bash
npm install uuid bcryptjs jsonwebtoken
npm install --save-dev @types/uuid @types/bcryptjs @types/jsonwebtoken
```

### 3. Environment Variables
Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

### Products
- `GET /api/products` - List all products (with filters)
- `POST /api/products` - Create product (admin only)
- `GET /api/products/[id]` - Get single product
- `PATCH /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin only)

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/customer-login` - Customer login
- `GET /api/auth/customer-me` - Get current customer
- `POST /api/auth/customer-logout` - Customer logout

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove cart item

### Orders
- `GET /api/orders` - Get customer orders
- `POST /api/orders` - Create new order
- `GET /api/admin/orders` - Get all orders (admin only)

## Admin Pages

### Product Management
- `/admin/ecommerce/products` - Full product CRUD interface
  - Create, edit, delete products
  - Manage pricing, inventory, categories
  - Upload images and set featured products

### Order Management
- `/admin/ecommerce/orders` - View and manage orders
  - View order details
  - Track order status
  - View customer information

## Frontend Integration

### Existing Storefront
The system integrates with your existing storefront UI:
- Products are fetched from the real database via `/api/products`
- Categories are loaded from `/api/categories`
- The mapping layer in `src/services/api.ts` converts database models to UI models

### Customer Authentication
Use the `CustomerAuthProvider` in your storefront:
```tsx
import { CustomerAuthProvider } from "@/lib/customer-auth-context";

<CustomerAuthProvider>
  {/* Your storefront components */}
</CustomerAuthProvider>
```

## Key Features

### 1. Product Management
- Full CRUD operations
- Image management
- Inventory tracking
- Product variants support
- Categories and tags
- SEO metadata

### 2. Shopping Cart
- Session-based cart for guests
- Persistent cart for logged-in users
- Real-time price calculation
- Stock validation

### 3. Checkout Process
- Customer registration/login
- Address management
- Order creation
- Inventory deduction
- Email notifications (ready for integration)

### 4. Order Management
- Order status tracking
- Payment status tracking
- Shipping information
- Order history for customers
- Admin order management

### 5. Customer Accounts
- Registration and login
- Profile management
- Order history
- Address book
- Wishlist support

## Next Steps

### 1. Add Sample Data
Create some categories and products through the admin interface:
1. Go to `/admin/ecommerce/products`
2. Click "Add Product"
3. Fill in product details
4. Save and publish

### 2. Test the Flow
1. Browse products on the storefront
2. Add items to cart
3. Register/login as a customer
4. Complete checkout
5. View order in admin panel

### 3. Customize
- Update product types to match your business
- Customize checkout flow
- Add payment gateway integration
- Configure email notifications
- Add shipping calculations

## Security Notes

- All admin endpoints require authentication
- Customer data is protected with RLS policies
- Passwords are hashed with bcrypt
- JWT tokens for session management
- HTTPS required in production

## Troubleshooting

### Products not showing
- Check database connection
- Verify products are marked as `is_active = true`
- Check RLS policies in Supabase

### Cart not persisting
- Verify cookies are enabled
- Check session/customer ID in cart_items table
- Ensure API endpoints are accessible

### Orders failing
- Check stock quantities
- Verify customer authentication
- Review order validation logic
- Check database constraints

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/          # Product API
│   │   ├── categories/        # Category API
│   │   ├── cart/              # Cart API
│   │   ├── orders/            # Order API
│   │   ├── auth/              # Authentication API
│   │   └── admin/             # Admin-only APIs
│   └── admin/(dashboard)/
│       └── ecommerce/
│           ├── products/      # Product management UI
│           └── orders/        # Order management UI
├── lib/
│   ├── ecommerce-types.ts     # TypeScript types
│   └── customer-auth-context.tsx  # Customer auth context
└── services/
    └── api.ts                 # API service layer (updated)
```

## Support

For issues or questions:
1. Check the database schema and RLS policies
2. Review API endpoint responses
3. Check browser console for errors
4. Verify environment variables
5. Review Supabase logs
