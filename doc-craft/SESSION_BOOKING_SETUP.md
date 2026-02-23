# Session Booking System Setup Guide

## Overview
A complete session booking system with Razorpay payment integration, WhatsApp redirect, and email confirmations using SMTP.

## Features
- Multi-type session booking (One-to-One, Need-Based, Group Healing, Learning Curve)
- Razorpay payment gateway integration
- Automatic WhatsApp redirect after payment
- Email confirmations to customers and admin
- SMTP email sending
- Booking management system

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Execute the file: session-bookings-schema.sql
```

This creates:
- `session_bookings` table with all necessary fields
- Indexes for performance
- Row Level Security policies
- Auto-update triggers

### 2. Install Dependencies

Already installed:
- `nodemailer` - For sending emails
- `@types/nodemailer` - TypeScript types
- `razorpay` - Payment gateway SDK

### 3. Environment Variables

Add these to your `.env.local`:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=admin@pratipal.in
```

### 4. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from Dashboard → Settings → API Keys
3. For testing, use Test Mode keys (starts with `rzp_test_`)
4. For production, use Live Mode keys (starts with `rzp_live_`)

### 5. SMTP Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
3. Use this app password in `SMTP_PASSWORD`

**Alternative SMTP Providers:**
- SendGrid: `smtp.sendgrid.net` (Port 587)
- Mailgun: `smtp.mailgun.org` (Port 587)
- AWS SES: `email-smtp.region.amazonaws.com` (Port 587)

### 6. WhatsApp Configuration

Update the WhatsApp number in `book-session/page.tsx`:

```typescript
const whatsappNumber = "919876543210"; // Replace with your number (with country code, no +)
```

## API Endpoints

### Create Booking
`POST /api/sessions/create-booking`

Creates a new session booking record.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91 98765 43210",
  "sessionType": "one_to_one",
  "frequency": "once_week",
  "amount": 4000,
  "notes": "Optional notes"
}
```

### Create Payment Order
`POST /api/sessions/create-payment`

Creates a Razorpay order for payment.

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 4000
}
```

### Verify Payment
`POST /api/sessions/verify-payment`

Verifies Razorpay payment and sends confirmation emails.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "bookingId": "uuid"
}
```

## Session Types & Pricing

### 1. One to One Healing Sessions
- Daily attention: ₹15,000
- Thrice a week: ₹10,000
- Twice a week: ₹7,000
- Once a week: ₹4,000

### 2. Need Based Healing
- Tarot Guidance: ₹2,000
- EFT: ₹2,500
- Reiki Energy Healing: ₹3,000
- Womb Healing: ₹5,000
- Acupressure: ₹3,500
- Routine Shaping: ₹4,000

### 3. Group Healing
- Fixed price: ₹1,500

### 4. Learning Curve (Courses)
- Womb Healing & Fertility: ₹12,000
- Energy Healing & EFT: ₹10,000
- Colour Therapy: ₹8,000
- Healing Candle Making: ₹6,000
- Healing Salt Making: ₹5,000
- Bach Remedies: ₹9,000
- Reiki (Usui & Karuna): ₹15,000
- Chakra Healing: ₹8,000
- Essential Oils Education: ₹7,000

## User Flow

1. **User fills booking form** → `/book-session`
   - Personal information
   - Session type selection
   - Additional notes

2. **Booking created** → API creates record in database

3. **Razorpay payment** → User redirected to payment gateway
   - Secure payment processing
   - Multiple payment methods

4. **Payment verification** → Backend verifies payment signature

5. **WhatsApp redirect** → Opens WhatsApp with pre-filled message

6. **Email confirmations** → Sent to customer and admin
   - Customer: Booking confirmation with details
   - Admin: New booking notification

7. **Success page** → `/booking-success`
   - Booking details
   - Next steps
   - Contact information

## Email Templates

### Customer Confirmation Email
- Beautiful gradient design matching brand
- Booking details
- Payment confirmation
- What happens next
- Contact information

### Admin Notification Email
- New booking alert
- Customer details
- Session information
- Action required notice

## Testing

### Test Payment Flow

1. Use Razorpay test mode keys
2. Test card numbers:
   - Success: 4111 1111 1111 1111
   - Failure: 4000 0000 0000 0002
3. Any CVV and future expiry date

### Test Email Sending

1. Use a test email address
2. Check spam folder
3. Verify email formatting

## Customization

### Update Session Types

Edit `src/lib/session-types.ts`:
```typescript
export const SESSION_TYPES = {
  // Add or modify session types here
};
```

### Customize Email Templates

Edit `src/lib/email.ts`:
- `generateBookingConfirmationEmail()` - Customer email
- `generateAdminNotificationEmail()` - Admin email

### Change WhatsApp Message

Edit `src/app/(storefront)/book-session/page.tsx`:
```typescript
const whatsappMessage = `Your custom message here`;
```

## Admin Dashboard Integration

To view bookings in admin panel, create:

`/admin/bookings/page.tsx`

```typescript
// Fetch and display session bookings
const { data: bookings } = await supabase
  .from("session_bookings")
  .select("*")
  .order("created_at", { ascending: false });
```

## Security Considerations

1. **Payment Verification**: Always verify Razorpay signature on backend
2. **Email Validation**: Validate email addresses before sending
3. **Rate Limiting**: Implement rate limiting on booking endpoints
4. **SMTP Credentials**: Never expose SMTP credentials in frontend
5. **RLS Policies**: Ensure proper Row Level Security in Supabase

## Troubleshooting

### Emails Not Sending
- Check SMTP credentials
- Verify app password (not regular password)
- Check spam folder
- Review SMTP logs in console

### Payment Failing
- Verify Razorpay keys are correct
- Check test/live mode consistency
- Review Razorpay dashboard for errors
- Ensure signature verification is correct

### WhatsApp Not Opening
- Check phone number format (no + or spaces)
- Verify URL encoding
- Test on mobile device

## Production Checklist

- [ ] Switch to Razorpay Live Mode keys
- [ ] Update WhatsApp number
- [ ] Configure production SMTP server
- [ ] Set up proper admin email
- [ ] Test email delivery
- [ ] Test payment flow end-to-end
- [ ] Set up booking notifications
- [ ] Configure backup email system
- [ ] Add analytics tracking
- [ ] Set up error monitoring

## Support

For issues or questions:
- Email: hello@pratipal.in
- Phone: +91 98765 43210

## File Structure

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── book-session/
│   │   │   └── page.tsx          # Booking form
│   │   └── booking-success/
│   │       └── page.tsx          # Success page
│   └── api/
│       └── sessions/
│           ├── create-booking/
│           │   └── route.ts      # Create booking
│           ├── create-payment/
│           │   └── route.ts      # Create Razorpay order
│           └── verify-payment/
│               └── route.ts      # Verify payment & send emails
├── lib/
│   ├── email.ts                  # Email utilities & templates
│   └── session-types.ts          # Session types & pricing
└── components/
    └── ui/
        ├── radio-group.tsx       # Radio button component
        └── textarea.tsx          # Textarea component
```

## Next Steps

1. Run the database schema
2. Configure environment variables
3. Test the booking flow
4. Customize session types and pricing
5. Update email templates with your branding
6. Set up admin dashboard for managing bookings
