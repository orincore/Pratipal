# Quick Start: Session Booking System

## ✅ What's Been Created

A complete session booking system with:
- ✅ Booking form with multiple session types
- ✅ Razorpay payment integration
- ✅ WhatsApp redirect after payment
- ✅ Email confirmations (customer + admin)
- ✅ SMTP email sending
- ✅ Success page
- ✅ Database schema
- ✅ API endpoints

## 🚀 Quick Setup (5 Minutes)

### 1. Run Database Schema
```sql
-- In Supabase SQL Editor, run:
session-bookings-schema.sql
```

### 2. Add Environment Variables
Add to `.env.local`:
```env
# Razorpay (Get from https://dashboard.razorpay.com/)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# SMTP Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@pratipal.in
```

### 3. Update WhatsApp Number
In `src/app/(storefront)/book-session/page.tsx` line 147:
```typescript
const whatsappNumber = "919876543210"; // Your number (no + or spaces)
```

### 4. Test It!
1. Visit: `http://localhost:3000/book-session`
2. Fill the form
3. Use test card: `4111 1111 1111 1111`
4. Complete payment
5. Check email inbox

## 📧 Gmail SMTP Setup

1. Enable 2FA on Gmail
2. Go to: Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use that password in `SMTP_PASSWORD`

## 💳 Razorpay Test Cards

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

## 📱 Features

### Session Types
1. **One to One** - ₹4,000 to ₹15,000
2. **Need Based** - ₹2,000 to ₹5,000
3. **Group Healing** - ₹1,500
4. **Learning Curve** - ₹5,000 to ₹15,000

### User Flow
1. Fill booking form
2. Select session type & options
3. Pay via Razorpay
4. Auto-redirect to WhatsApp
5. Receive confirmation email
6. View success page

### Admin Gets
- Email notification for each booking
- All booking details
- Customer contact info

## 🎨 Gradient Theme Applied
- Booking form uses gradient colors
- Success page with gradient header
- Email templates with gradient design
- Matches your logo perfectly!

## 📁 Files Created

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── book-session/page.tsx       # Booking form
│   │   └── booking-success/page.tsx    # Success page
│   └── api/sessions/
│       ├── create-booking/route.ts     # Create booking
│       ├── create-payment/route.ts     # Razorpay order
│       └── verify-payment/route.ts     # Verify & email
├── lib/
│   ├── email.ts                        # Email templates
│   └── session-types.ts                # Session config
└── components/ui/
    ├── radio-group.tsx                 # Radio buttons
    └── textarea.tsx                    # Text area

session-bookings-schema.sql             # Database schema
SESSION_BOOKING_SETUP.md                # Full documentation
```

## 🔗 Navigation

Added "Book Session" link to header navigation automatically!

## ⚠️ Before Going Live

- [ ] Switch to Razorpay Live keys
- [ ] Update WhatsApp number
- [ ] Configure production SMTP
- [ ] Test email delivery
- [ ] Test payment flow
- [ ] Update admin email

## 🆘 Troubleshooting

**Emails not sending?**
- Check SMTP credentials
- Use app password (not regular password)
- Check spam folder

**Payment failing?**
- Verify Razorpay keys
- Check test/live mode match
- Review browser console

**WhatsApp not opening?**
- Check number format (no + or spaces)
- Test on mobile device

## 📚 Full Documentation

See `SESSION_BOOKING_SETUP.md` for complete details.

## 🎉 You're Ready!

Visit `/book-session` and start accepting bookings!
