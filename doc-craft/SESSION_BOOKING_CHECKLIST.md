# ✅ Session Booking System - Setup Checklist

## 🎉 Installation Complete!

All code has been created and dependencies installed. Follow this checklist to get your session booking system live.

---

## 📋 Pre-Launch Checklist

### 1. Database Setup ⏱️ 2 minutes

- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `session-bookings-schema.sql`
- [ ] Execute the SQL script
- [ ] Verify `session_bookings` table is created
- [ ] Check that indexes and policies are in place

**Verification:**
```sql
SELECT * FROM session_bookings LIMIT 1;
```

---

### 2. Environment Variables ⏱️ 3 minutes

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Razorpay credentials
- [ ] Configure SMTP settings
- [ ] Set admin email
- [ ] Verify all variables are set

**Required Variables:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@pratipal.in
```

---

### 3. Razorpay Setup ⏱️ 5 minutes

- [ ] Sign up at [razorpay.com](https://razorpay.com)
- [ ] Activate test mode
- [ ] Copy API Key ID (starts with `rzp_test_`)
- [ ] Copy API Secret Key
- [ ] Add to `.env.local`
- [ ] Test with test card: `4111 1111 1111 1111`

**Get Keys:** Dashboard → Settings → API Keys

---

### 4. Gmail SMTP Setup ⏱️ 5 minutes

- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Go to Google Account → Security
- [ ] Click "App passwords"
- [ ] Generate password for "Mail"
- [ ] Copy the 16-character password
- [ ] Add to `SMTP_PASSWORD` in `.env.local`

**Alternative:** Use SendGrid, Mailgun, or AWS SES

---

### 5. WhatsApp Configuration ⏱️ 1 minute

- [ ] Open `src/app/(storefront)/book-session/page.tsx`
- [ ] Find line 147: `const whatsappNumber = "919876543210"`
- [ ] Replace with your WhatsApp number
- [ ] Format: Country code + number (no + or spaces)
- [ ] Example: `919876543210` for +91 98765 43210

---

### 6. Test Booking Flow ⏱️ 5 minutes

- [ ] Start dev server: `npm run dev`
- [ ] Visit: `http://localhost:3000/book-session`
- [ ] Fill in the form
- [ ] Select a session type
- [ ] Click "Proceed to Payment"
- [ ] Use test card: `4111 1111 1111 1111`
- [ ] Complete payment
- [ ] Verify WhatsApp opens
- [ ] Check success page loads
- [ ] Verify email received

**Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

---

### 7. Email Testing ⏱️ 3 minutes

- [ ] Complete a test booking
- [ ] Check customer email inbox
- [ ] Check spam folder if not found
- [ ] Verify email formatting looks good
- [ ] Check admin email received notification
- [ ] Verify all booking details are correct

---

### 8. Customization (Optional) ⏱️ 10 minutes

- [ ] Update session types in `src/lib/session-types.ts`
- [ ] Modify pricing if needed
- [ ] Customize email templates in `src/lib/email.ts`
- [ ] Update WhatsApp message text
- [ ] Add your logo to emails
- [ ] Adjust gradient colors if needed

---

### 9. Production Preparation ⏱️ 10 minutes

- [ ] Switch to Razorpay Live Mode keys
- [ ] Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` with live key
- [ ] Update `RAZORPAY_KEY_SECRET` with live secret
- [ ] Configure production SMTP server
- [ ] Update admin email to production email
- [ ] Test payment with real card (small amount)
- [ ] Verify production emails work
- [ ] Set up error monitoring (Sentry, etc.)

---

### 10. Admin Dashboard (Optional) ⏱️ 30 minutes

Create admin page to view bookings:

```typescript
// src/app/admin/(dashboard)/bookings/page.tsx
import { getServiceSupabase } from "@/lib/auth";

export default async function BookingsPage() {
  const supabase = getServiceSupabase();
  const { data: bookings } = await supabase
    .from("session_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1>Session Bookings</h1>
      {/* Display bookings in a table */}
    </div>
  );
}
```

---

## 🚀 Launch Checklist

### Before Going Live:

- [ ] All environment variables configured
- [ ] Database schema executed
- [ ] Test booking completed successfully
- [ ] Emails sending correctly
- [ ] WhatsApp redirect working
- [ ] Success page displaying properly
- [ ] Razorpay live keys configured
- [ ] Production SMTP configured
- [ ] Error monitoring set up
- [ ] Backup email system configured

---

## 📊 Monitoring After Launch

### First Week:

- [ ] Monitor booking submissions
- [ ] Check email delivery rates
- [ ] Verify payment success rates
- [ ] Review customer feedback
- [ ] Check for any errors in logs
- [ ] Ensure admin notifications working
- [ ] Test WhatsApp redirect on mobile

---

## 🆘 Troubleshooting Guide

### Issue: Emails Not Sending

**Solutions:**
1. Verify SMTP credentials are correct
2. Use app password, not regular password
3. Check spam folder
4. Review console logs for errors
5. Test SMTP connection separately
6. Try alternative SMTP provider

### Issue: Payment Failing

**Solutions:**
1. Verify Razorpay keys are correct
2. Check test/live mode consistency
3. Review Razorpay dashboard for errors
4. Ensure signature verification is working
5. Check browser console for errors
6. Test with different cards

### Issue: WhatsApp Not Opening

**Solutions:**
1. Check number format (no + or spaces)
2. Verify URL encoding is correct
3. Test on mobile device
4. Check browser popup blocker
5. Try different browsers

### Issue: Page Not Loading

**Solutions:**
1. Check all dependencies installed
2. Restart dev server
3. Clear Next.js cache: `rm -rf .next`
4. Check for TypeScript errors
5. Review browser console

---

## 📞 Support Contacts

**Technical Issues:**
- Razorpay: support@razorpay.com
- Supabase: support@supabase.io
- Gmail SMTP: Google Support

**Project Documentation:**
- Full Setup: `SESSION_BOOKING_SETUP.md`
- Quick Start: `QUICK_START_SESSION_BOOKING.md`
- This Checklist: `SESSION_BOOKING_CHECKLIST.md`

---

## ✨ Success Indicators

You'll know everything is working when:

✅ Booking form loads without errors
✅ Payment gateway opens correctly
✅ Payment completes successfully
✅ WhatsApp opens with pre-filled message
✅ Success page displays booking details
✅ Customer receives confirmation email
✅ Admin receives notification email
✅ Booking appears in database

---

## 🎯 Next Steps After Launch

1. **Week 1:** Monitor closely, fix any issues
2. **Week 2:** Gather customer feedback
3. **Month 1:** Analyze booking patterns
4. **Ongoing:** Optimize conversion rates

---

## 📈 Optimization Ideas

- Add booking calendar integration
- Implement automated reminders
- Create customer dashboard
- Add session rescheduling
- Implement refund system
- Add customer reviews
- Create loyalty program
- Add referral system

---

## 🎉 You're Ready to Launch!

Once all checkboxes are ticked, your session booking system is ready to accept real bookings!

**Test URL:** `http://localhost:3000/book-session`
**Production URL:** `https://yourdomain.com/book-session`

Good luck with your launch! 🚀
