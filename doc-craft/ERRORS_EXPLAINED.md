# 🔍 Errors Explained & Fixed

## Error 1: MetadataBase Warning ⚠️

### What You Saw:
```
⚠ metadataBase property in metadata export is not set
```

### What It Means:
- **Not Critical** - Just a warning
- Affects social media sharing (Facebook, Twitter)
- Next.js needs a base URL for Open Graph images
- Currently defaulting to `http://localhost:3000`

### Impact:
- ❌ Social media previews might not work correctly
- ✅ Your site still works fine
- ✅ Booking system unaffected

### ✅ Fixed:
Updated `src/app/layout.tsx` to include:
```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
```

### Result:
- ✅ Warning will disappear
- ✅ Social sharing will work properly
- ✅ SEO improved

---

## Error 2: Database Table Not Found 🚨

### What You Saw:
```
Error creating booking: {
  code: 'PGRST205',
  message: "Could not find the table 'public.session_bookings' in the schema cache"
}
POST /api/sessions/create-booking 500
```

### What It Means:
- **CRITICAL** - Must fix to use booking system
- The database table doesn't exist yet
- You haven't run the SQL schema
- API can't save bookings

### Impact:
- ❌ Booking form won't work
- ❌ Payments can't be processed
- ❌ No bookings can be saved
- ❌ System is non-functional

### ✅ How to Fix:

#### Step 1: Open Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign in
3. Select your project

#### Step 2: Open SQL Editor
1. Click "SQL Editor" in sidebar
2. Click "New Query"

#### Step 3: Run Schema
1. Open file: `session-bookings-schema.sql`
2. Copy all contents
3. Paste into SQL Editor
4. Click "Run" button

#### Step 4: Verify
```sql
SELECT * FROM session_bookings LIMIT 1;
```
Should return: "Success. No rows returned"

### Result After Fix:
- ✅ Table created in database
- ✅ Booking form works
- ✅ Payments can be processed
- ✅ Bookings saved successfully

---

## Error 3: Customer Auth 401 ℹ️

### What You Saw:
```
GET /api/auth/customer-me 401 in 208ms
```

### What It Means:
- **Normal Behavior** - Not an error!
- User is not logged in
- API returns 401 (Unauthorized)
- This is expected for guest users

### Impact:
- ✅ No impact on booking system
- ✅ Guests can still book sessions
- ✅ Login is optional for bookings

### No Fix Needed:
- This is how it should work
- Guests can book without account
- Login only needed for order history

---

## 🎯 Priority Order

### 1. Fix Database (CRITICAL) 🚨
**Must do first!**
- Run `session-bookings-schema.sql` in Supabase
- Without this, nothing works

### 2. Fix MetadataBase (Optional) ⚠️
**Nice to have**
- Already fixed in code
- Improves SEO and social sharing

### 3. Ignore Auth 401 (Normal) ℹ️
**No action needed**
- This is expected behavior
- System working as designed

---

## 📋 Quick Fix Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy `session-bookings-schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify table created
- [ ] Test booking form
- [ ] Confirm no errors

---

## ✅ How to Know It's Fixed

### Before Fix:
```
❌ Error creating booking
❌ Table not found
❌ 500 error
❌ Booking fails
```

### After Fix:
```
✅ Booking created successfully
✅ Payment gateway opens
✅ No database errors
✅ Bookings saved
```

---

## 🧪 Test After Fix

1. Visit: `http://localhost:3000/book-session`
2. Fill in form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +91 9876543210
   - Session: Group Healing
3. Click "Proceed to Payment"
4. Should see Razorpay payment gateway ✅

---

## 🆘 Still Having Issues?

### Check These:

1. **Supabase Connection**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SECRET_KEY=eyJhbGci...
   ```

2. **Table Exists**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'session_bookings';
   ```

3. **Environment Variables**
   - Restart dev server after adding env vars
   - Check `.env.local` file exists
   - Verify no typos in variable names

4. **Supabase Project**
   - Project is active (not paused)
   - Using correct project
   - API keys are valid

---

## 📞 Common Questions

### Q: Do I need to restart the server?
**A:** Yes, after running the SQL schema, restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Q: Where is the SQL file?
**A:** In your project root: `session-bookings-schema.sql`

### Q: Can I test without Razorpay?
**A:** No, but you can use test mode with test cards

### Q: Will this delete existing data?
**A:** No, the schema uses `CREATE TABLE IF NOT EXISTS`

---

## 🎉 Success Checklist

After fixing, you should have:

- ✅ No database errors
- ✅ Booking form loads
- ✅ Payment gateway opens
- ✅ No 500 errors
- ✅ Bookings save to database
- ✅ Emails send successfully
- ✅ WhatsApp redirect works
- ✅ Success page displays

---

## 📚 Related Documentation

- **Database Setup:** `SESSION_BOOKING_SETUP.md`
- **Quick Start:** `QUICK_START_SESSION_BOOKING.md`
- **Fix Guide:** `FIX_DATABASE_ERROR.md`
- **Checklist:** `SESSION_BOOKING_CHECKLIST.md`

---

**Fix the database first, then everything will work!** 🚀
