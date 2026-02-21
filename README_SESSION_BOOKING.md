# 🎯 Session Booking System - Complete Guide

## 📦 What You Got

A fully functional session booking system with:

✅ **Beautiful Booking Form** - Gradient-themed UI matching your logo
✅ **Razorpay Integration** - Secure payment processing
✅ **WhatsApp Redirect** - Automatic customer engagement
✅ **Email Notifications** - Professional SMTP emails
✅ **Success Page** - Confirmation and next steps
✅ **Database Schema** - Complete booking management
✅ **API Endpoints** - RESTful backend

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies ✅ DONE
```bash
npm install nodemailer @types/nodemailer @radix-ui/react-radio-group
```

### 2. Run Database Schema
```sql
-- In Supabase SQL Editor, execute:
session-bookings-schema.sql
```

### 3. Configure Environment
```env
# Add to .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@pratipal.in
```

### 4. Update WhatsApp Number
```typescript
// src/app/(storefront)/book-session/page.tsx line 147
const whatsappNumber = "919876543210"; // Your number
```

### 5. Test It!
```bash
npm run dev
# Visit: http://localhost:3000/book-session
```

---

## 📁 Files Created

```
✅ src/app/(storefront)/book-session/page.tsx
✅ src/app/(storefront)/booking-success/page.tsx
✅ src/app/api/sessions/create-booking/route.ts
✅ src/app/api/sessions/create-payment/route.ts
✅ src/app/api/sessions/verify-payment/route.ts
✅ src/lib/email.ts
✅ src/lib/session-types.ts
✅ src/components/ui/radio-group.tsx
✅ src/components/ui/textarea.tsx
✅ session-bookings-schema.sql
✅ .env.example
```

---

## 💰 Session Types & Pricing

### 1. One to One Healing
- Daily: ₹15,000
- 3x/week: ₹10,000
- 2x/week: ₹7,000
- 1x/week: ₹4,000

### 2. Need Based Healing
- Tarot: ₹2,000
- EFT: ₹2,500
- Reiki: ₹3,000
- Womb Healing: ₹5,000
- Acupressure: ₹3,500
- Routine: ₹4,000

### 3. Group Healing
- Fixed: ₹1,500

### 4. Learning Curve
- Womb Healing: ₹12,000
- Energy Healing: ₹10,000
- Colour Therapy: ₹8,000
- Candle Making: ₹6,000
- Salt Making: ₹5,000
- Bach Remedies: ₹9,000
- Reiki: ₹15,000
- Chakra Healing: ₹8,000
- Essential Oils: ₹7,000

---

## 🔄 User Flow

```
1. Customer visits /book-session
   ↓
2. Fills form & selects session type
   ↓
3. Clicks "Proceed to Payment"
   ↓
4. Razorpay payment gateway opens
   ↓
5. Customer completes payment
   ↓
6. Payment verified on backend
   ↓
7. WhatsApp opens with message
   ↓
8. Redirects to /booking-success
   ↓
9. Emails sent (customer + admin)
   ↓
10. Booking saved in database
```

---

## 📧 Email Templates

### Customer Email
- Beautiful gradient design
- Booking confirmation
- Payment details
- Next steps
- Contact information

### Admin Email
- New booking alert
- Customer details
- Session information
- Action required

---

## 🎨 Design Features

- Gradient colors from your logo
- Responsive mobile design
- Smooth animations
- Loading states
- Error handling
- Toast notifications
- Accessible forms

---

## 🔐 Security Features

- Payment signature verification
- HTTPS required in production
- Environment variable protection
- Row Level Security (RLS)
- Input validation
- CSRF protection
- Rate limiting ready

---

## 📚 Documentation

1. **SESSION_BOOKING_SETUP.md** - Complete technical guide
2. **QUICK_START_SESSION_BOOKING.md** - 5-minute setup
3. **SESSION_BOOKING_CHECKLIST.md** - Pre-launch checklist
4. **README_SESSION_BOOKING.md** - This file

---

## 🧪 Testing

### Test Cards (Razorpay)
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test Flow
1. Fill booking form
2. Select session type
3. Use test card
4. Verify WhatsApp opens
5. Check success page
6. Confirm emails received

---

## 🛠️ Customization

### Update Session Types
Edit `src/lib/session-types.ts`:
```typescript
export const SESSION_TYPES = {
  // Modify pricing, add/remove types
};
```

### Customize Emails
Edit `src/lib/email.ts`:
```typescript
export function generateBookingConfirmationEmail(data) {
  // Customize HTML template
}
```

### Change WhatsApp Message
Edit `src/app/(storefront)/book-session/page.tsx`:
```typescript
const whatsappMessage = `Your custom message`;
```

---

## 🚨 Troubleshooting

### Emails Not Sending?
1. Check SMTP credentials
2. Use app password (Gmail)
3. Check spam folder
4. Review console logs

### Payment Failing?
1. Verify Razorpay keys
2. Check test/live mode
3. Review signature verification
4. Check browser console

### WhatsApp Not Opening?
1. Check number format
2. Test on mobile
3. Verify URL encoding

---

## 📊 Admin Dashboard

To view bookings, create:

```typescript
// src/app/admin/(dashboard)/bookings/page.tsx
const { data: bookings } = await supabase
  .from("session_bookings")
  .select("*")
  .order("created_at", { ascending: false });
```

---

## 🌐 Production Deployment

### Before Launch:
- [ ] Switch to Razorpay Live keys
- [ ] Configure production SMTP
- [ ] Update WhatsApp number
- [ ] Test end-to-end flow
- [ ] Set up error monitoring
- [ ] Configure backups

### After Launch:
- Monitor booking submissions
- Check email delivery
- Review payment success rate
- Gather customer feedback
- Optimize conversion

---

## 📞 Support

**Email:** hello@pratipal.in
**Phone:** +91 98765 43210

**Technical Support:**
- Razorpay: support@razorpay.com
- Supabase: support@supabase.io

---

## 🎉 Success Metrics

Your system is working when:

✅ Form loads without errors
✅ Payment completes successfully
✅ WhatsApp opens automatically
✅ Success page displays
✅ Emails arrive in inbox
✅ Bookings saved in database
✅ Admin receives notifications

---

## 🚀 Launch Checklist

- [ ] Database schema executed
- [ ] Environment variables set
- [ ] Razorpay configured
- [ ] SMTP configured
- [ ] WhatsApp number updated
- [ ] Test booking completed
- [ ] Emails verified
- [ ] Production keys added
- [ ] Error monitoring set up
- [ ] Ready to launch! 🎊

---

## 💡 Pro Tips

1. **Test thoroughly** before going live
2. **Monitor emails** in first week
3. **Keep test mode** until confident
4. **Backup database** regularly
5. **Track conversion** rates
6. **Gather feedback** from customers
7. **Optimize pricing** based on data
8. **Add analytics** tracking

---

## 🎯 Next Features (Ideas)

- Calendar integration
- Automated reminders
- Customer dashboard
- Session rescheduling
- Refund system
- Customer reviews
- Loyalty program
- Referral system
- Multi-language support
- Video call integration

---

## 📈 Analytics to Track

- Booking conversion rate
- Payment success rate
- Email open rate
- WhatsApp engagement
- Popular session types
- Average booking value
- Customer retention
- Cancellation rate

---

## 🏆 Best Practices

1. **Always verify** payment signatures
2. **Send emails** asynchronously
3. **Log errors** for debugging
4. **Test on mobile** devices
5. **Monitor performance** metrics
6. **Keep backups** of bookings
7. **Update documentation** regularly
8. **Respond quickly** to customers

---

## 🎊 You're All Set!

Your session booking system is production-ready with:

✅ Secure payment processing
✅ Professional email notifications
✅ WhatsApp integration
✅ Beautiful gradient UI
✅ Complete documentation
✅ Error handling
✅ Mobile responsive
✅ Database management

**Start accepting bookings now!** 🚀

Visit: `http://localhost:3000/book-session`

---

*Built with ❤️ for Pratipal Healing*
