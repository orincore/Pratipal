# Product Requirements Document — Pratipal Store
**Version**: 1.0  
**Date**: 2026-06-21  
**Brand**: Pratipal — Healing & Wellness by Dr. Aparnaa Singh  
**Domain**: pratipal.in

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Users & Roles](#3-users--roles)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Data Models](#6-data-models)
7. [Feature Specifications](#7-feature-specifications)
   - 7.1 [E-Commerce — Product Catalog](#71-e-commerce--product-catalog)
   - 7.2 [Shopping Cart](#72-shopping-cart)
   - 7.3 [Checkout & Payments](#73-checkout--payments)
   - 7.4 [Order Management](#74-order-management)
   - 7.5 [Shipping & Logistics](#75-shipping--logistics)
   - 7.6 [Service Booking](#76-service-booking)
   - 7.7 [Courses](#77-courses)
   - 7.8 [Blog & Content](#78-blog--content)
   - 7.9 [Landing Pages](#79-landing-pages)
   - 7.10 [Customer Accounts](#710-customer-accounts)
   - 7.11 [Admin Dashboard](#711-admin-dashboard)
   - 7.12 [Media Management](#712-media-management)
   - 7.13 [Gallery & Quotes](#713-gallery--quotes)
   - 7.14 [Reviews & Testimonials](#714-reviews--testimonials)
   - 7.15 [Contact & Support](#715-contact--support)
   - 7.16 [SEO & Analytics](#716-seo--analytics)
   - 7.17 [Email Notifications](#717-email-notifications)
8. [API Reference](#8-api-reference)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Environment Configuration](#11-environment-configuration)
12. [Pages & Routes](#12-pages--routes)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Known Limitations & Tech Debt](#14-known-limitations--tech-debt)

---

## 1. Product Overview

**Pratipal Store** is a full-stack wellness e-commerce and service platform built with Next.js 16 (App Router). It serves a dual purpose:

1. **E-Commerce Store** — sells physical wellness products (scented candles, essential oils, healing salts, mood refreshers) with full cart, checkout, payment, and shipment tracking.
2. **Service & Course Platform** — enables customers to book one-on-one healing sessions with Dr. Aparnaa Singh and purchase online healing courses.

The platform includes a fully integrated admin dashboard for content management, order operations, and business analytics. Custom landing pages can be created and published independently from the main store to support marketing campaigns.

**Core Value Proposition**: A unified platform where a customer can discover a wellness brand, buy products, book sessions, and learn through courses — all in one place.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Drive product sales | Monthly order count, GMV (Gross Merchandise Value) |
| Enable service bookings | Monthly session bookings, booking conversion rate |
| Grow course enrollments | Course purchase count |
| Build an email audience | Landing page invitation signups |
| Reduce admin operations overhead | Time-to-ship per order, automated tracking updates |
| Improve SEO discoverability | Organic search rankings, blog traffic |

---

## 3. Users & Roles

### 3.1 Guest Customer
- Browses the store, reads blog posts, views courses and services.
- Can add items to cart (guest cart via `localStorage`).
- Must register/login to complete checkout.

### 3.2 Registered Customer
- All guest capabilities.
- Manages personal address book (multiple shipping/billing addresses).
- Views full order history with Shiprocket tracking.
- Manages account profile (name, email, password).
- Can book healing sessions.

### 3.3 Admin
- Full access to the admin dashboard.
- Manages products, categories, orders, services, courses, blogs, landing pages, hero sections, gallery, reviews, quotes, contacts, media, and shipping settings.
- Creates Shiprocket shipments.
- Views and responds to contact form submissions.
- Manages invitation signups from landing pages.
- Only role that can create/modify admin accounts (seeded via `/api/auth/seed`).

---

## 4. Tech Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | — |
| UI Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 3.4.17 |
| Component Primitives | Radix UI | multiple |
| State Management | Zustand (with persist) | 4.5.5 |
| Rich Text Editor | Tiptap | 3.19.0 |
| Form Handling | React Hook Form | 7.54.2 |
| Form Validation | Zod | 3.24.1 |
| Drag & Drop | dnd-kit | 6.3.1 |
| Notifications | Sonner | 1.7.1 |
| Icons | Lucide React | 0.468.0 |
| Animations | tailwindcss-animate | — |
| Variant Styling | class-variance-authority | — |
| Date Utilities | date-fns | — |

### Backend
| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (via Next.js API Routes) | — |
| Database | MongoDB | 7.1.0 |
| ODM | Mongoose | 9.2.3 |
| Authentication | JWT (jsonwebtoken) | 9.0.3 |
| Password Hashing | bcryptjs | 3.0.3 |
| Email | Nodemailer (Hostinger SMTP) | 8.0.1 |
| ID Generation | uuid, nanoid | — |

### Third-Party Services
| Service | Purpose |
|---------|---------|
| Razorpay | Payment processing (products + sessions) |
| Shiprocket | Shipping & logistics fulfillment |
| Cloudflare R2 | Object storage for all media assets |
| Google Tag Manager | Analytics and conversion tracking |
| Trustpilot | Customer reviews widget |
| Hostinger SMTP | Transactional email delivery |

### Fonts
- **Playfair Display** — Display headings
- **Cormorant Garamond** — Editorial serif text
- **Inter** — UI sans-serif body text

---

## 5. System Architecture

```
Browser (React/Next.js Client)
        │
        ├── Zustand (cart, client state)
        ├── CustomerAuthContext (JWT cookie)
        └── HeaderThemeContext / CartAnimationContext
                │
                ▼
Next.js Server (API Routes + SSR)
        │
        ├── MongoDB (via Mongoose) — All persistent data
        ├── Cloudflare R2 (via AWS S3 SDK) — Media storage
        ├── Razorpay API — Payment orders & verification
        ├── Shiprocket API — Shipment creation & tracking
        ├── Nodemailer / Hostinger SMTP — Transactional email
        └── Trustpilot — Review data
```

**Rendering Strategy**:
- Storefront pages: SSR / SSG where possible for SEO.
- Admin pages: Client-side rendering (CSR) with auth guards.
- API routes: Server-side, authenticated via JWT in cookies.

**Image Storage**:
- All user-uploaded images are stored in Cloudflare R2.
- Public URL base: `https://media.pratipal.in`
- Organized into folders: `/uploads`, `/products`, `/services`, `/courses`, `/hero`, `/gallery`.

---

## 6. Data Models

### 6.1 AuthUser
Admin user account.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `email` | String | Unique, required |
| `password_hash` | String | bcrypt, required |
| `full_name` | String | — |
| `role` | String | Default: `"admin"` |
| `status` | String | `"active"` \| `"inactive"` |
| `created_at` | Date | — |
| `updated_at` | Date | — |

### 6.2 Customer
Registered storefront customer.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `email` | String | Unique, required |
| `password_hash` | String | bcrypt |
| `first_name` | String | — |
| `last_name` | String | — |
| `phone` | String | — |
| `avatar_url` | String | — |
| `is_verified` | Boolean | Default: `false` |
| `reset_token` | String | Password reset token |
| `reset_token_expires` | Date | — |
| `created_at` | Date | — |

### 6.3 CustomerAddress
Customer's saved shipping/billing addresses.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `customer_id` | ObjectId | Ref: Customer |
| `type` | String | `"shipping"` \| `"billing"` |
| `full_name` | String | — |
| `phone` | String | — |
| `address_line1` | String | — |
| `address_line2` | String | — |
| `city` | String | — |
| `state` | String | — |
| `postal_code` | String | — |
| `country` | String | Default: `"India"` |
| `is_default` | Boolean | — |

### 6.4 Product

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `name` | String | Required |
| `slug` | String | Unique URL identifier |
| `description` | String | HTML content |
| `price` | Number | Base price (INR) |
| `sale_price` | Number | Optional discounted price |
| `stock_quantity` | Number | — |
| `stock_status` | String | `"in_stock"` \| `"out_of_stock"` \| `"on_backorder"` |
| `category_id` | ObjectId | Ref: Category |
| `images` | String[] | R2 URLs |
| `featured_image` | String | Primary image URL |
| `weight` | Number | Grams (for shipping calc) |
| `dimensions` | Object | `{length, width, height}` in cm |
| `tags` | String[] | — |
| `highlights` | String[] | Bullet point features |
| `is_featured` | Boolean | Homepage display |
| `meta_title` | String | SEO title |
| `meta_description` | String | SEO description |
| `status` | String | `"active"` \| `"inactive"` |
| `created_at` | Date | — |

### 6.5 Category

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `name` | String | Required |
| `slug` | String | Unique |
| `description` | String | — |
| `parent_id` | ObjectId | Self-ref for nested categories |
| `image` | String | R2 URL |
| `display_order` | Number | Sort order |
| `is_active` | Boolean | — |

### 6.6 Order

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `order_number` | String | Unique, timestamped |
| `customer_id` | ObjectId | Ref: Customer (optional for guests) |
| `customer_email` | String | — |
| `customer_name` | String | — |
| `customer_phone` | String | — |
| `shipping_address` | Object | Embedded address |
| `billing_address` | Object | Embedded address |
| `subtotal` | Number | Before tax + shipping |
| `tax_amount` | Number | 18% GST |
| `shipping_cost` | Number | — |
| `discount_amount` | Number | — |
| `total_amount` | Number | Final payable amount |
| `payment_status` | String | `"pending"` \| `"paid"` \| `"failed"` \| `"refunded"` |
| `payment_method` | String | `"razorpay"` |
| `razorpay_order_id` | String | — |
| `razorpay_payment_id` | String | — |
| `razorpay_signature` | String | — |
| `order_status` | String | `"pending"` \| `"processing"` \| `"shipped"` \| `"delivered"` \| `"cancelled"` |
| `shiprocket_order_id` | String | — |
| `shiprocket_shipment_id` | String | — |
| `tracking_number` | String | AWB code |
| `tracking_history` | Array | Status update log |
| `notes` | String | Internal notes |
| `created_at` | Date | — |

### 6.7 OrderItem

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `order_id` | ObjectId | Ref: Order |
| `product_id` | ObjectId | Ref: Product |
| `product_name` | String | Snapshot at time of purchase |
| `product_image` | String | Snapshot |
| `quantity` | Number | — |
| `price` | Number | Unit price at purchase |
| `subtotal` | Number | `price × quantity` |

### 6.8 CartItem
Server-side persistent cart (not the primary cart — Zustand/localStorage is primary).

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `customer_id` | ObjectId | Ref: Customer (nullable) |
| `session_id` | String | Guest session ID |
| `product_id` | ObjectId | Ref: Product |
| `quantity` | Number | — |
| `price` | Number | Price at add-to-cart time |
| `created_at` | Date | — |

### 6.9 Service

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `title` | String | — |
| `slug` | String | Unique |
| `description` | String | — |
| `base_price` | Number | — |
| `frequency_options` | Array | `[{label, value, price}]` — e.g., single, monthly |
| `category` | String | — |
| `image` | String | R2 URL |
| `display_order` | Number | — |
| `is_active` | Boolean | — |

### 6.10 SessionBooking

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `booking_number` | String | Unique |
| `customer_id` | ObjectId | Ref: Customer (optional) |
| `customer_name` | String | — |
| `customer_email` | String | — |
| `customer_phone` | String | — |
| `service_id` | ObjectId | Ref: Service |
| `service_name` | String | Snapshot |
| `frequency_label` | String | e.g., `"Monthly"` |
| `order_type` | String | `"service"` \| `"course"` |
| `session_date` | String | `YYYY-MM-DD` |
| `session_time` | String | e.g., `"10:00 AM"` |
| `amount` | Number | Paid amount (INR) |
| `payment_status` | String | `"pending"` \| `"paid"` \| `"failed"` |
| `booking_status` | String | `"pending"` \| `"confirmed"` \| `"in_progress"` \| `"completed"` \| `"cancelled"` |
| `razorpay_order_id` | String | — |
| `razorpay_payment_id` | String | — |
| `razorpay_signature` | String | — |
| `whatsapp_redirect_url` | String | Post-booking WhatsApp follow-up |
| `created_at` | Date | — |

### 6.11 Course

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `title` | String | — |
| `slug` | String | Unique |
| `subtitle` | String | — |
| `description` | String | HTML |
| `price` | Number | INR |
| `featured_image` | String | R2 URL |
| `level` | String | `"beginner"` \| `"intermediate"` \| `"advanced"` \| `"all"` |
| `curriculum` | Array | `[{title, description, topics[]}]` |
| `what_you_receive` | String[] | Benefit bullets |
| `who_is_this_for` | String[] | Target audience |
| `bonuses` | String[] | Bonus items |
| `instructor` | Object | `{name, bio, avatar}` |
| `status` | String | `"draft"` \| `"published"` \| `"archived"` |
| `is_featured` | Boolean | — |
| `created_at` | Date | — |

### 6.12 Blog

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `title` | String | — |
| `slug` | String | Unique |
| `excerpt` | String | Short summary |
| `content` | String | Full HTML (from Tiptap) |
| `featured_image` | String | R2 URL |
| `category` | String | — |
| `tags` | String[] | — |
| `author` | String | — |
| `read_time` | Number | Minutes |
| `status` | String | `"draft"` \| `"published"` \| `"archived"` |
| `is_featured` | Boolean | — |
| `meta_title` | String | SEO |
| `meta_description` | String | SEO |
| `seo_keyword` | String | — |
| `schema_type` | String | JSON-LD type |
| `custom_schema` | String | Raw JSON-LD |
| `created_at` | Date | — |
| `published_at` | Date | — |

### 6.13 LandingPage

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `title` | String | — |
| `slug` | String | Unique URL |
| `content` | JSON | Section-based page content |
| `theme` | Object | `{primary, secondary, accent, background}` CSS colors |
| `seo_title` | String | — |
| `seo_description` | String | — |
| `schema_type` | String | JSON-LD schema type |
| `custom_schema` | String | Raw JSON-LD |
| `status` | String | `"draft"` \| `"published"` |
| `created_at` | Date | — |

### 6.14 InvitationRequest
Signups captured via landing page CTAs.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `landing_page_id` | ObjectId | Ref: LandingPage |
| `landing_page_slug` | String | — |
| `first_name` | String | — |
| `email` | String | — |
| `whatsapp_number` | String | — |
| `location` | String | — |
| `created_at` | Date | — |

### 6.15 HeroSection

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `title` | String | — |
| `subtitle` | String | — |
| `description` | String | — |
| `cta_text` | String | Button label |
| `cta_link` | String | Button URL |
| `background_type` | String | `"default"` \| `"image"` \| `"video"` \| `"none"` |
| `background_url` | String | R2 URL |
| `card_type` | String | `"image"` \| `"video"` |
| `card_url` | String | R2 URL |
| `display_order` | Number | — |
| `is_active` | Boolean | — |

### 6.16 Quote

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `text` | String | Quote content |
| `author` | String | — |
| `date` | String | `YYYY-MM-DD`, unique |
| `status` | String | `"active"` \| `"draft"` |

### 6.17 Review

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `name` | String | Reviewer name |
| `location` | String | — |
| `rating` | Number | 1–5 |
| `text` | String | Review content |
| `role` | String | Reviewer role/profession |
| `source` | String | `"trustpilot"` \| `"google"` \| `"direct"` |
| `verified` | Boolean | — |
| `featured` | Boolean | Homepage display |
| `date` | Date | — |

### 6.18 Contact
Contact form submissions.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `name` | String | — |
| `email` | String | — |
| `phone` | String | — |
| `subject` | String | — |
| `message` | String | — |
| `status` | String | `"new"` \| `"in_progress"` \| `"resolved"` \| `"closed"` |
| `admin_notes` | String | Internal notes |
| `created_at` | Date | — |

### 6.19 ShippingSettings

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `free_shipping_threshold` | Number | Order value (INR) for free shipping |
| `flat_rate` | Number | Flat shipping rate (INR) |
| `weight_based_enabled` | Boolean | Enable weight-based pricing |
| `weight_tiers` | Array | `[{min_weight, max_weight, rate}]` |

### 6.20 GalleryImage

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `url` | String | R2 public URL |
| `r2_key` | String | R2 object key |
| `caption` | String | — |
| `display_order` | Number | — |

### 6.21 Media
Tracks all uploaded files.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | — |
| `name` | String | Original filename |
| `url` | String | R2 public URL |
| `r2_key` | String | R2 object key |
| `type` | String | `"image"` \| `"video"` |
| `size` | Number | Bytes |
| `uploaded_at` | Date | — |

---

## 7. Feature Specifications

### 7.1 E-Commerce — Product Catalog

**Product Listing (`/shop`)**
- Displays all active products with pagination.
- Filters by category (using `categoryId` query param).
- Full-text search on product name and tags.
- Each product card shows: featured image, name, price (with sale price strikethrough if applicable), and an "Add to Cart" button.
- "Add to Cart" triggers a fly-to-cart animation (via `CartAnimationContext`).

**Product Detail (`/product/[slug]`)**
- Media gallery: multiple images with thumbnail navigation; supports video cards.
- Product name, price, sale price, stock status badge.
- Highlights section (bullet points from `highlights[]`).
- Full HTML description (from `description` field, rendered as rich text).
- Quantity selector with stock validation.
- "Add to Cart" button (disabled when out of stock).
- Related/recommended products section (by category).
- Customer reviews section.
- SEO: meta title, meta description, JSON-LD `Product` schema.

**Stock Management**
- `stock_status`: `"in_stock"` / `"out_of_stock"` / `"on_backorder"`.
- `stock_quantity`: numeric count; decremented on order payment confirmation.
- Out-of-stock products remain visible but non-purchasable.

**Category Navigation**
- Nested category support via `parent_id` self-reference.
- Category filter in `/shop` route.
- Dedicated category pages (`/candles`, `/mood-refresher`).

---

### 7.2 Shopping Cart

**Cart Storage**
- Primary: Zustand store persisted in `localStorage` (key: `"pratipal-cart"`).
- Store version: 2 (with migration from v1 that sanitizes product data).
- Secondary: MongoDB `CartItem` collection for server-side persistence (used in checkout API).

**Cart State (`useCartStore`)**
| Action | Behavior |
|--------|---------|
| `addItem(product, id?)` | Adds item or increments quantity if already present |
| `removeItem(identifier)` | Removes by product ID or cart item ID |
| `updateQuantity(identifier, qty)` | Sets quantity; removes if qty ≤ 0 |
| `clearCart()` | Empties cart |
| `setItems(items)` | Bulk replace (used on checkout completion) |
| `getTotal()` | Returns sum of `price × quantity` across all items |
| `getItemCount()` | Returns total item count |

**Cart Drawer**
- Slide-in sidebar accessible from header.
- Shows all items with image, name, quantity controls, and remove button.
- Subtotal displayed.
- "Proceed to Checkout" button navigates to `/checkout`.

**Guest Cart**
- Cart persists in localStorage without login.
- At checkout, guest is prompted to login/register.

---

### 7.3 Checkout & Payments

**Checkout Flow (`/checkout`)**

1. **Address Selection**: Customer selects from saved addresses or creates a new one.
2. **Shipping Calculation**: 
   - Calls `/api/cart/calculate-shipping` with order weight.
   - Applies weight-based tiers OR flat rate (based on `ShippingSettings`).
   - Auto-applies free shipping if subtotal ≥ `free_shipping_threshold`.
3. **Order Summary**: Shows items, subtotal, shipping cost, 18% GST, and total.
4. **Payment**: 
   - POST to `/api/razorpay/create-order` → creates pending `Order` in DB, returns `razorpay_order_id`.
   - Razorpay JS SDK modal opens in browser.
   - On success, Razorpay returns `{razorpay_payment_id, razorpay_order_id, razorpay_signature}`.
   - POST to `/api/razorpay/verify-payment` → server validates HMAC signature.
   - On success: `Order.payment_status` set to `"paid"`, `OrderItem` records created, confirmation email sent.
   - Redirect to `/order-confirmation`.
5. **On Failure**: Redirect to `/order-failed`.

**Tax Calculation**
- GST fixed at 18% applied to subtotal (before shipping).

**Payment Gateway: Razorpay**
- Orders created server-side (amount in paise).
- Signature verification: `HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)`.
- Payment statuses: `pending` → `paid` (on success) or `failed` (on failure).

---

### 7.4 Order Management

**Customer View (`/order-history`)**
- Lists all orders for the authenticated customer.
- Shows order number, date, total, payment status, order status.
- Shipment tracking link when AWB code is available.

**Admin View (`/admin/ecommerce/orders`)**
- Paginated table of all orders.
- Filters by order status, payment status, date range.
- Order detail view: customer info, billing/shipping addresses, line items, totals, Razorpay payment reference, Shiprocket tracking info.
- Status update: admin can change `order_status`.
- Create Shiprocket shipment button (calls `/api/admin/orders/[id]/shiprocket`).
- Order total recalculation utility (`/admin/orders/fix-totals`).

**Order Number Format**
- Timestamped: `PP-{YYYYMMDD}-{random}` (e.g., `PP-20260621-A3K9`).

**Order Lifecycle**
```
pending (payment not yet made)
  → paid (payment confirmed by Razorpay)
    → processing (admin acknowledges)
      → shipped (Shiprocket AWB assigned)
        → delivered (Shiprocket update)
          → cancelled (at any pre-shipped stage)
failed (payment failed)
```

---

### 7.5 Shipping & Logistics

**Shiprocket Integration**
- Authentication: Email/password login to Shiprocket API (token valid 24 hours, re-authenticated as needed).
- **Order Creation**: Admin manually triggers Shiprocket order from the order detail page.
  - Sends billing/shipping address, items (with SKU, quantity, price, weight, dimensions).
  - Returns `shiprocket_order_id`, `shipment_id`, AWB tracking number.
- **Tracking**: 
  - `/api/shipping/track?order_id={id}` fetches live tracking from Shiprocket.
  - Tracking history stored in `Order.tracking_history` array.
  - Webhook `/api/shiprocket/webhook` receives push status updates.
- **Mock Mode**: Set `SHIPROCKET_MOCK=true` to return test responses (no real API calls).
- **Pickup Location**: Configured via `SHIPROCKET_PICKUP_LOCATION` env var.

**Shipping Cost Calculation** (`/lib/shipping-calculator.ts`)
- Reads `ShippingSettings` from DB.
- Logic:
  1. If order subtotal ≥ `free_shipping_threshold` → shipping = 0.
  2. Else if `weight_based_enabled` → find matching weight tier and apply tier rate.
  3. Else → apply `flat_rate`.

---

### 7.6 Service Booking

**Service Catalog (`/booking`)**
- Lists all active services fetched from `/api/services`.
- Each service shows title, description, frequency options with pricing.
- Frequency options are selectable (e.g., Single Session ₹X, Monthly Package ₹Y).

**Booking Flow**
1. Customer selects a service and frequency option.
2. Fills in: name, email, phone, preferred date, preferred time.
3. POST to `/api/sessions/create-payment`:
   - Creates `SessionBooking` document with `payment_status: "pending"`.
   - Creates Razorpay order for the booking amount.
   - Returns `razorpay_order_id`.
4. Razorpay modal opens.
5. On payment success, POST to `/api/sessions/verify-payment`:
   - Verifies Razorpay signature.
   - Updates `SessionBooking.payment_status` to `"paid"`.
   - Updates `booking_status` to `"confirmed"`.
   - Sends booking confirmation email.
6. Redirect to `/booking-success`.
7. Optional: WhatsApp redirect URL (`whatsapp_redirect_url`) for post-booking follow-up.

**Admin View (`/admin/service-orders`)**
- Lists all bookings with customer details, service, date/time, amount, payment and booking status.
- Status update controls.

---

### 7.7 Courses

**Course Catalog (`/courses`)**
- Lists all published courses.
- Displays level badge (Beginner / Intermediate / Advanced / All Levels).
- Featured course highlighted.

**Course Detail (`/courses/[slug]`)**
- Full course description (HTML).
- Curriculum sections with topics.
- `what_you_receive`, `who_is_this_for`, `bonuses` sections.
- Instructor profile with bio and avatar.
- Price and enroll CTA (redirects to booking flow with `order_type: "course"`).

**Course Orders**
- Course purchases flow through the same `SessionBooking` model with `order_type: "course"`.
- Tracked in `/admin/course-orders`.

**Admin (`/admin/courses`)**
- CRUD for courses via Tiptap editor.
- Curriculum builder (sections + topics array management).
- Image upload via R2.
- Status management (draft / published / archived).

---

### 7.8 Blog & Content

**Blog Listing (`/blogs`)**
- Paginated list of published blog posts.
- Category filter.
- Featured post highlighted.
- Card shows: featured image, title, excerpt, author, read time, date.

**Blog Post (`/blogs/[slug]`)**
- Full HTML content rendered from Tiptap output.
- Author, date, read time, category, tags.
- Featured image (hero).
- SEO: meta title, meta description, keyword, JSON-LD Article schema (custom or auto-generated).

**Admin Blog Editor (`/admin/blogs`)**
- Create/edit posts with full Tiptap rich text editor.
- Tiptap extensions: Bold, Italic, Underline, Strike, Headings (H1–H4), BulletList, OrderedList, Blockquote, HorizontalRule, Link, Image (R2 upload inline), YouTube embed, TextColor, Highlight, TextAlign, Table.
- Featured image upload (R2).
- Metadata fields: excerpt, author, category, tags, read_time, SEO fields.
- Status toggle: draft / published / archived.
- Slug auto-generated from title (editable).

---

### 7.9 Landing Pages

**Purpose**
Custom marketing pages for campaigns (e.g., `/essential-oil`, `/candles`, `/p/healing-workshop`) created and managed independently from the main store.

**Public Access**
- Routes: `/[slug]` and `/p/[slug]`.
- `LandingPageRenderer` component reads JSON `content` and renders sections.
- Custom theme applied per page (`theme.primary`, `theme.secondary`, etc.).
- SEO: custom `seo_title`, `seo_description`, custom JSON-LD schema.

**Thank You Page**
- `/[slug]/thank-you` — Shown after invitation form submission.

**Invitation Capture**
- Landing pages include a signup form.
- Fields: first name, email, WhatsApp number, location.
- Submitted to `/api/invitations`.
- Stored in `InvitationRequest` with `landing_page_id` and `landing_page_slug`.

**Admin Builder (`/admin/landing-pages`)**
- List, create, edit, delete landing pages.
- Drag-and-drop template editor (`TemplateEditor` component with dnd-kit).
- Theme color configuration (primary, secondary, accent, background).
- SEO metadata and JSON-LD schema fields.
- Duplicate landing page functionality.
- Status toggle (draft / published).
- Invitation signups view per page (`/admin/landing-pages/[id]/invitations`).

---

### 7.10 Customer Accounts

**Registration (`/register`)**
- Fields: first name, last name, email, password.
- Validation: Zod schema (email format, password min length).
- POST to `/api/auth/register`.
- Creates `Customer` document with hashed password.
- Sends welcome email.
- Auto-logs in after registration.

**Login (`/login`)**
- Fields: email, password, optional "Remember Me".
- POST to `/api/auth/customer-login`.
- Returns JWT set in `customer_session` cookie.
- Sends login notification email to customer.
- Remember Me: sets longer cookie expiry.

**Password Reset (`/forgot-password`)**
- Step 1: Enter email → POST to `/api/auth/forgot-password` → sends reset token via email.
- Step 2: Enter token + new password → PATCH to `/api/auth/forgot-password` → updates `password_hash`.

**Account Dashboard (`/account`)**
- Profile: update name, phone.
- Change email/password via `/api/auth/update-credentials`.
- Address book: list, add, edit, delete addresses (set default).

**OTP Verification**
- Endpoint: `POST /api/auth/send-otp` → sends OTP.
- Endpoint: `PUT /api/auth/send-otp` → verifies OTP and marks `customer.is_verified = true`.

**Session Management**
- `CustomerAuthContext` loads customer on app mount via `/api/auth/customer-me`.
- JWT in `customer_session` cookie (httpOnly).
- Logout: DELETE `customer_session` cookie via `/api/auth/customer-logout`.

---

### 7.11 Admin Dashboard

**Access**
- Route: `/admin` (requires `pratipal_session` cookie with `role: "admin"`).
- Login: `/admin/login`.

**Sections**

| Section | Route | Capability |
|---------|-------|-----------|
| Dashboard | `/admin` | Overview metrics |
| Products | `/admin/ecommerce/products` | CRUD, image upload, stock management |
| Create Product | `/admin/ecommerce/products/create` | Product creation form |
| Categories | `/admin/categories` | CRUD, nested hierarchy |
| Orders | `/admin/ecommerce/orders` | View, filter, update status, create Shiprocket shipment |
| Fix Totals | `/admin/orders/fix-totals` | Recalculate order totals utility |
| Services | `/admin/services` | CRUD, frequency options management |
| Service Orders | `/admin/service-orders` | View & manage session bookings |
| Courses | `/admin/courses` | CRUD with Tiptap editor, curriculum builder |
| Course Orders | `/admin/course-orders` | View course enrollments |
| Blogs | `/admin/blogs` | CRUD with full Tiptap rich editor |
| Landing Pages | `/admin/landing-pages` | CRUD with drag-drop template builder |
| Hero Sections | `/admin/hero-sections` | Manage homepage hero slides |
| Gallery | `/admin/gallery` | Upload, reorder, delete gallery images |
| Reviews | `/admin/reviews` | CRUD, feature/unfeature reviews |
| Quotes | `/admin/quotes` | CRUD, date assignment |
| Contacts | `/admin/contacts` | View submissions, update status, add notes |
| Media | `/admin/media` | View all uploaded files |
| Shipping | `/admin/shipping` | Configure shipping rates and thresholds |
| Settings | `/admin/settings` | General settings |

---

### 7.12 Media Management

**Upload**
- Endpoint: `POST /api/upload` (generic), `POST /api/upload/products`, `/upload/services`, `/upload/courses`.
- File validation: images up to 10MB, videos up to 50MB.
- Unique filename: `{UUID}.{ext}`.
- Uploaded to Cloudflare R2 with `public-read` ACL and 1-year cache control.
- Metadata stored in `Media` collection.
- Public URL: `https://media.pratipal.in/{folder}/{filename}`.

**Delete**
- R2 object deleted by `r2_key`.
- `Media` document removed from DB.

**Folders in R2**
| Folder | Used For |
|--------|---------|
| `/uploads` | General uploads |
| `/products` | Product images |
| `/services` | Service images |
| `/courses` | Course thumbnails |
| `/hero` | Hero section backgrounds/cards |
| `/gallery` | Gallery showcase images |

---

### 7.13 Gallery & Quotes

**Gallery (`/gallery`)**
- Displays `GalleryImage` records ordered by `display_order`.
- Admin can upload, reorder (drag-drop in admin), and delete images.

**Daily Quote (`/quotes`)**
- Displays quote matching today's date (`YYYY-MM-DD`).
- Falls back to most recent active quote if no match.
- Admin creates quotes with a specific date and status.

---

### 7.14 Reviews & Testimonials

**Sources**
- `"trustpilot"` — Synced from Trustpilot widget/API.
- `"google"` — Manually entered.
- `"direct"` — Direct customer feedback.

**Display**
- Homepage `TrustpilotSection` shows featured reviews.
- Product pages show product-specific reviews.

**Admin (`/admin/reviews`)**
- CRUD for all reviews.
- Toggle `featured` flag.
- Toggle `verified` badge.

---

### 7.15 Contact & Support

**Contact Form (`/contact`)**
- Fields: name, email, phone, subject, message.
- Submitted to `POST /api/contact`.
- Stored as `Contact` document with `status: "new"`.

**Admin View (`/admin/contacts`)**
- Lists all submissions.
- Filter by status.
- Update status: `new` → `in_progress` → `resolved` → `closed`.
- Add internal admin notes.

---

### 7.16 SEO & Analytics

**Meta Tags**
- Each page sets `<title>`, `<meta name="description">`, Open Graph tags.
- SEO constants centralized in `/lib/seo.ts`.

**Structured Data (JSON-LD)**
- Products: `schema.org/Product`.
- Blog posts: `schema.org/Article` (configurable type, custom schema override).
- Landing pages: configurable schema type with custom JSON-LD.

**Sitemap**
- Auto-generated at `/sitemap.xml` via `sitemap.ts`.
- Includes all published products, blogs, courses, and landing pages.

**robots.txt**
- Generated via `robots.ts`.
- Blocks admin routes from indexing.

**Google Tag Manager**
- GTM ID: `GTM-W88FQD7L`.
- Loaded via `<Script>` with `beforeInteractive` strategy in root layout.

**Trustpilot Widget**
- Bootstrap script loaded for review display.

---

### 7.17 Email Notifications

**SMTP Configuration**
- Provider: Hostinger SMTP.
- Server: `smtp.hostinger.com:465` (SSL).
- From: `support@pratipal.in`.
- Admin email: `suradkaradarsh15@gmail.com`.

**Email Templates**

| Event | Recipient | Content |
|-------|-----------|---------|
| Customer Registration | Customer | Welcome message |
| Customer Login | Customer | Login notification with timestamp |
| Password Reset | Customer | Reset link/token |
| Order Confirmation | Customer | Order summary, items, total, tracking info |
| Order Confirmation (copy) | Admin | Same order details |
| Session Booking Confirmation | Customer | Booking details, date/time, service |

**Sending Pattern**
- Fire-and-forget (async, non-blocking).
- Errors in email sending are logged but do not block the primary operation.

---

## 8. API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/login` | None | Admin login |
| POST | `/api/auth/logout` | Admin | Admin logout |
| GET | `/api/auth/me` | Admin | Get current admin |
| POST | `/api/auth/register` | None | Customer registration |
| POST | `/api/auth/customer-login` | None | Customer login |
| POST | `/api/auth/customer-logout` | Customer | Customer logout |
| GET | `/api/auth/customer-me` | Customer | Get current customer |
| POST | `/api/auth/forgot-password` | None | Request reset token |
| PATCH | `/api/auth/forgot-password` | None | Confirm password reset |
| POST | `/api/auth/send-otp` | Customer | Send verification OTP |
| PUT | `/api/auth/send-otp` | Customer | Verify OTP |
| POST | `/api/auth/update-credentials` | Customer | Update email or password |
| POST | `/api/auth/seed` | None | Seed initial admin account |

### Products
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/products` | None | List products (filters: categoryId, featured, search, limit, offset) |
| GET | `/api/products/[id]` | None | Get product by ID |
| GET | `/api/products/slug/[slug]` | None | Get product by slug |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/[id]` | Admin | Full update |
| PATCH | `/api/products/[id]` | Admin | Partial update |
| DELETE | `/api/products/[id]` | Admin | Delete product |
| GET | `/api/categories` | None | List all categories |

### Cart
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/cart` | Customer | Get cart items |
| POST | `/api/cart` | Customer | Add item |
| PUT | `/api/cart/[id]` | Customer | Update quantity |
| DELETE | `/api/cart/[id]` | Customer | Remove item |
| POST | `/api/cart/clear` | Customer | Clear cart |
| POST | `/api/cart/calculate-shipping` | None | Calculate shipping for given weight |

### Orders
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/orders` | Customer | Customer's own orders |
| GET | `/api/orders/[id]` | Customer | Order detail |
| POST | `/api/orders` | Customer | Create order |
| GET | `/api/admin/orders` | Admin | All orders |
| GET | `/api/admin/orders/[id]` | Admin | Order detail |
| PUT | `/api/admin/orders/[id]` | Admin | Update order |
| POST | `/api/admin/orders/[id]/shiprocket` | Admin | Create Shiprocket shipment |
| POST | `/api/admin/orders/[id]/recalculate` | Admin | Recalculate order totals |

### Payments
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/razorpay/create-order` | Customer | Create Razorpay payment order |
| POST | `/api/razorpay/verify-payment` | Customer | Verify Razorpay signature |
| GET | `/api/razorpay/health` | None | Payment gateway health check |

### Bookings & Sessions
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/bookings/create` | None | Create service booking |
| GET | `/api/bookings/customer` | Customer | Customer's bookings |
| GET | `/api/bookings/verify-payment` | None | Verify booking payment |
| POST | `/api/sessions/create-payment` | None | Create Razorpay order for booking |
| POST | `/api/sessions/verify-payment` | None | Verify booking payment |

### Content
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/blogs` | None | Published blogs |
| GET | `/api/blogs/[slug]` | None | Blog post by slug |
| GET | `/api/courses` | None | Published courses |
| GET | `/api/courses/[slug]` | None | Course by slug |
| GET | `/api/services` | None | Active services |
| GET | `/api/quotes` | None | Today's quote |
| GET | `/api/gallery` | None | Gallery images |

### Admin Content
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET/POST | `/api/admin/blogs` | Admin | List / create blogs |
| PUT/DELETE | `/api/admin/blogs/[id]` | Admin | Update / delete blog |
| GET/POST | `/api/admin/courses` | Admin | List / create courses |
| PUT/DELETE | `/api/admin/courses/[id]` | Admin | Update / delete course |
| GET/POST | `/api/admin/services` | Admin | List / create services |
| PUT/DELETE | `/api/admin/services/[id]` | Admin | Update / delete service |
| GET/POST | `/api/admin/hero-sections` | Admin | List / create hero sections |
| PUT/DELETE | `/api/admin/hero-sections/[id]` | Admin | Update / delete hero section |
| GET/POST | `/api/admin/quotes` | Admin | List / create quotes |
| PUT/DELETE | `/api/admin/quotes/[id]` | Admin | Update / delete quote |
| GET/POST | `/api/admin/reviews` | Admin | List / create reviews |
| PUT/DELETE | `/api/admin/reviews/[id]` | Admin | Update / delete review |
| GET | `/api/admin/contacts` | Admin | List contacts |
| PUT | `/api/admin/contacts/[id]` | Admin | Update contact status/notes |

### Landing Pages & Invitations
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET/POST | `/api/landing-pages` | Admin | List / create |
| GET/PUT | `/api/landing-pages/[id]` | Admin | Get / update |
| POST | `/api/landing-pages/[id]/duplicate` | Admin | Duplicate |
| GET | `/api/landing-pages/slug/[slug]` | None | Get by slug (public) |
| POST | `/api/invitations` | None | Submit invitation request |
| GET | `/api/invitations` | Admin | List invitations |

### Media & Upload
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/upload` | Admin | General file upload to R2 |
| POST | `/api/upload/products` | Admin | Product image upload |
| POST | `/api/upload/services` | Admin | Service image upload |
| POST | `/api/upload/courses` | Admin | Course image upload |

### Customer Account
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/account/profile` | Customer | Get profile |
| GET/POST | `/api/account/addresses` | Customer | List / create addresses |
| PUT/DELETE | `/api/account/addresses/[id]` | Customer | Update / delete address |

### Settings & Shipping
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/admin/shipping-settings` | Admin | Get shipping config |
| POST | `/api/admin/shipping-settings` | Admin | Update shipping config |
| GET | `/api/shipping/track` | None | Track shipment |

### Utilities
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | `/api/health` | None | API health check |
| GET | `/api/trustpilot` | None | Fetch Trustpilot data |
| POST | `/api/test-email` | Admin | Test email delivery |
| POST | `/api/shiprocket/webhook` | None (signed) | Shiprocket status webhook |
| GET | `/api/debug/product/[slug]` | None | Debug product data |

---

## 9. Authentication & Authorization

### Cookie Strategy
| Cookie | Scope | Expiry | Purpose |
|--------|-------|--------|---------|
| `pratipal_session` | Admin | 30 days | Admin JWT |
| `customer_session` | Customer | 7 days (30 if Remember Me) | Customer JWT |

**Cookie flags**: `httpOnly: true`, `secure: true` (in production), `sameSite: "lax"`.

### JWT Payload
```json
{
  "sub": "<user_id>",
  "email": "user@example.com",
  "role": "admin | customer",
  "full_name": "optional",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Auth Verification (Server-Side)
- `getUserFromRequest(req)` — extracts and verifies JWT from `pratipal_session` cookie.
- Returns user payload or throws 401 if invalid/expired.
- Admin endpoints: call `getUserFromRequest` and check `role === "admin"`.
- Customer endpoints: dedicated `getCustomerFromRequest` using `customer_session`.

### Route Protection
- Admin routes: middleware or per-handler check on `pratipal_session`.
- Customer routes: per-handler check on `customer_session`.
- Public routes: no authentication required.
- Admin pages: client-side redirect to `/admin/login` if no valid session cookie.

---

## 10. Third-Party Integrations

### Razorpay
- **Purpose**: Payment processing for e-commerce orders and session/course bookings.
- **Keys**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- **Client SDK**: Razorpay JS loaded client-side to open payment modal.
- **Server SDK**: `razorpay` npm package for order creation.
- **Signature Verification**: `HMAC-SHA256(order_id + "|" + payment_id, secret)`.
- **Amount Unit**: All amounts in paise (₹1 = 100 paise).

### Shiprocket
- **Purpose**: Order fulfillment and shipment tracking.
- **Auth**: Username/password login → Bearer token (24h TTL).
- **Order Creation**: Requires product weights and dimensions.
- **Tracking**: AWB number used for status lookups.
- **Webhook**: `POST /api/shiprocket/webhook` receives status push events; validated by `SHIPROCKET_WEBHOOK_SECRET`.
- **Dev Mock**: `SHIPROCKET_MOCK=true` bypasses real API calls.

### Cloudflare R2
- **Purpose**: All user-uploaded media (images, videos).
- **SDK**: `@aws-sdk/client-s3` with custom R2 endpoint.
- **Endpoint**: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`.
- **Public URL**: `https://media.pratipal.in`.
- **Permissions**: `public-read` ACL on all uploaded objects.
- **Cache**: `Cache-Control: public, max-age=31536000` (1 year).
- **File Limits**: Images ≤ 10MB, Videos ≤ 50MB.

### Hostinger SMTP (Email)
- **Purpose**: All transactional emails.
- **Host**: `smtp.hostinger.com:465` (SSL/TLS).
- **From Address**: `support@pratipal.in`.
- **Admin CC**: `suradkaradarsh15@gmail.com`.
- **Library**: Nodemailer.

### Google Tag Manager
- **GTM ID**: `GTM-W88FQD7L`.
- **Script Strategy**: `beforeInteractive` (loaded immediately on page).
- **Purpose**: Analytics events, conversion tracking, remarketing.

### Trustpilot
- **Purpose**: Display verified customer reviews.
- **Implementation**: Bootstrap widget script loaded in layout.
- **Custom endpoint**: `/api/trustpilot` fetches review data.

---

## 11. Environment Configuration

All configuration is via environment variables. A `.env` file at project root is required.

| Variable | Required | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `AUTH_JWT_SECRET` | Yes | JWT signing secret (admin) |
| `JWT_SECRET` | Yes | JWT signing secret (customer) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (e.g., `https://pratipal.in`) |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay key secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Client-side Razorpay key |
| `R2_ACCOUNT_ID` | Yes | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret key |
| `R2_BUCKET_NAME` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | Public URL base for R2 assets |
| `EMAIL_HOST` | Yes | SMTP host |
| `EMAIL_PORT` | Yes | SMTP port (465) |
| `EMAIL_USER` | Yes | SMTP username |
| `EMAIL_PASS` | Yes | SMTP password |
| `EMAIL_FROM` | Yes | From email address |
| `ADMIN_EMAIL` | Yes | Admin notification email |
| `SHIPROCKET_EMAIL` | Yes | Shiprocket API email |
| `SHIPROCKET_PASSWORD` | Yes | Shiprocket API password |
| `SHIPROCKET_PICKUP_LOCATION` | Yes | Shiprocket pickup location name |
| `SHIPROCKET_WEBHOOK_SECRET` | Yes | Webhook validation secret |
| `SHIPROCKET_MOCK` | No | Set `"true"` to mock Shiprocket responses |
| `NODE_ENV` | No | `"development"` \| `"production"` |

---

## 12. Pages & Routes

### Storefront Pages (under `(storefront)` layout group)
| Route | Page | Auth |
|-------|------|------|
| `/` | Homepage — hero, featured products, courses, testimonials, quotes | None |
| `/shop` | Product catalog with search, filters, pagination | None |
| `/product/[slug]` | Product detail with media gallery, add to cart | None |
| `/cart` | Cart review | None |
| `/checkout` | Checkout with address, shipping calc, payment | Customer |
| `/order-confirmation` | Post-payment success | None |
| `/order-failed` | Post-payment failure | None |
| `/order-history` | Customer order list with tracking | Customer |
| `/booking` | Service booking form | None |
| `/booking-success` | Post-booking confirmation | None |
| `/courses` | Course catalog | None |
| `/courses/[slug]` | Course detail | None |
| `/blogs` | Blog listing | None |
| `/blogs/[slug]` | Blog post | None |
| `/gallery` | Image gallery | None |
| `/about` | About page | None |
| `/contact` | Contact form | None |
| `/quotes` | Daily quote | None |
| `/candles` | Candles category page | None |
| `/mood-refresher` | Mood refresher product/feature page | None |
| `/account` | Customer profile dashboard | Customer |
| `/account/orders` | Customer order history | Customer |
| `/login` | Customer login | None |
| `/register` | Customer registration | None |
| `/forgot-password` | Password reset | None |
| `/disclaimer` | Legal disclaimer | None |
| `/privacy-policy` | Privacy policy | None |
| `/refund-policy` | Refund policy | None |
| `/shipping-policy` | Shipping policy | None |
| `/terms` | Terms of service | None |

### Dynamic Landing Pages
| Route | Description | Auth |
|-------|-------------|------|
| `/[slug]` | Custom landing page by slug | None |
| `/[slug]/thank-you` | Post-signup thank you page | None |
| `/p/[slug]` | Alternative landing page route | None |

### Admin Pages (under `/admin` path)
| Route | Description | Auth |
|-------|-------------|------|
| `/admin/login` | Admin login | None |
| `/admin` | Dashboard overview | Admin |
| `/admin/ecommerce/products` | Product list | Admin |
| `/admin/ecommerce/products/create` | Create product | Admin |
| `/admin/ecommerce/orders` | Order management | Admin |
| `/admin/orders/fix-totals` | Recalculate order totals | Admin |
| `/admin/categories` | Category management | Admin |
| `/admin/services` | Service management | Admin |
| `/admin/service-orders` | Session booking management | Admin |
| `/admin/courses` | Course management | Admin |
| `/admin/course-orders` | Course enrollment management | Admin |
| `/admin/blogs` | Blog management | Admin |
| `/admin/landing-pages` | Landing page list | Admin |
| `/admin/landing-pages/[id]/edit` | Landing page editor | Admin |
| `/admin/landing-pages/[id]/invitations` | Invitation signups | Admin |
| `/admin/hero-sections` | Homepage hero management | Admin |
| `/admin/gallery` | Gallery management | Admin |
| `/admin/reviews` | Reviews management | Admin |
| `/admin/quotes` | Daily quotes management | Admin |
| `/admin/contacts` | Contact submissions | Admin |
| `/admin/media` | Media library | Admin |
| `/admin/shipping` | Shipping settings | Admin |
| `/admin/settings` | General settings | Admin |

---

## 13. Non-Functional Requirements

### Performance
- Next.js SSR/SSG for SEO-critical storefront pages.
- Image optimization via Next.js `Image` component (remote patterns configured in `next.config.mjs`).
- Cloudflare R2 CDN with 1-year cache headers for all media assets.
- Zustand with localStorage persistence to avoid redundant API calls for cart state.
- MongoDB indexed on frequently queried fields (slug, customer_id, order_number, payment_status).

### Security
- All admin API routes validate JWT and `role === "admin"` before processing.
- Customer API routes validate `customer_session` JWT before processing.
- Passwords hashed with bcryptjs (minimum rounds: 10).
- Razorpay signature verification on server-side prevents payment bypass.
- Shiprocket webhook validated with `SHIPROCKET_WEBHOOK_SECRET`.
- JWT secrets stored exclusively in environment variables.
- httpOnly cookies prevent XSS token theft.
- CORS headers set in `next.config.mjs` for API routes.

### Reliability
- Email sending is fire-and-forget; failures do not block primary user flows.
- Shiprocket errors do not block order creation (order stored locally, Shiprocket sync can be retried manually).
- Order created before Razorpay payment to prevent data loss on browser close.
- Zustand persist with version migration prevents cart corruption on schema changes.

### Scalability
- MongoDB is the single data store; no relational database joins — data is embedded or referenced.
- R2 storage decoupled from app servers.
- Stateless JWT authentication — no server-side session storage.

### SEO
- `sitemap.xml` auto-generated including all published products, blogs, courses, landing pages.
- `robots.txt` blocks admin routes.
- JSON-LD structured data on product, blog, and landing pages.
- Meta tags on all public-facing pages.

### Accessibility
- Radix UI components provide full keyboard navigation and ARIA attributes.
- Semantic HTML structure in all page components.

---

## 14. Known Limitations & Tech Debt

| Item | Description |
|------|-------------|
| Legacy Supabase code | `/lib/supabase/auth-context.tsx` is a remnant of a previous authentication system (Supabase) being replaced by the current MongoDB + JWT approach. Not actively used. |
| Guest checkout | Cart is guest-friendly but checkout requires login; a true guest checkout (no account creation) is not implemented. |
| No JWT refresh | Once a JWT expires, the user is logged out. Silent token refresh is not implemented. |
| Shiprocket manual trigger | Shiprocket orders must be manually created by an admin. There is no automatic fulfillment trigger on payment success. |
| Flat GST rate | Tax is hardcoded at 18% GST. No per-product or per-category tax rules. |
| No real-time stock sync | Stock quantity is decremented on payment but not locked during checkout; concurrent purchases of the same low-stock item could oversell. |
| Static legal pages | Disclaimer, privacy policy, refund policy, shipping policy, and terms pages appear to be static HTML; not editable from the admin dashboard. |
| Debug endpoint exposed | `/api/debug/product/[slug]` is accessible without authentication. Should be guarded or removed in production. |
| Admin seed endpoint | `/api/auth/seed` creates the initial admin account. It is not protected and should be disabled or removed after initial setup. |
| `/admin/products` legacy route | There appears to be both `/admin/products` (legacy) and `/admin/ecommerce/products` (current). The legacy route should be reviewed for removal. |
| `products.ts` static data | `/src/data/products.ts` contains static product data, likely a legacy artifact from before database integration. |
| Cart server-side sync | The MongoDB `CartItem` model exists but the Zustand localStorage cart is the primary storage. Server-side cart may not stay in sync with localStorage. |
