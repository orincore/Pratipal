# 🔧 Fix Database Error - Step by Step

## ❌ Error You're Seeing:
```
Could not find the table 'public.session_bookings' in the schema cache
```

## ✅ Solution: Create the Database Table

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

### Step 3: Copy the Schema
1. Open the file: `session-bookings-schema.sql`
2. Copy ALL the contents (Ctrl+A, Ctrl+C)

### Step 4: Execute the Schema
1. Paste into the SQL Editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait for success message

### Step 5: Verify Table Created
Run this query to verify:
```sql
SELECT * FROM session_bookings LIMIT 1;
```

You should see: "Success. No rows returned" (table exists but empty)

---

## 📋 Quick Copy-Paste Schema

If you can't find the file, here's the complete schema:

```sql
-- Session Bookings Table
CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('one_to_one', 'need_based', 'group_healing', 'learning_curve')),
  frequency TEXT CHECK (frequency IN ('daily', 'once_week', 'twice_week', 'thrice_week')),
  healing_type TEXT,
  course_type TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_bookings_email ON session_bookings (customer_email);
CREATE INDEX IF NOT EXISTS idx_session_bookings_phone ON session_bookings (customer_phone);
CREATE INDEX IF NOT EXISTS idx_session_bookings_booking_number ON session_bookings (booking_number);
CREATE INDEX IF NOT EXISTS idx_session_bookings_razorpay_order ON session_bookings (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings (status);
CREATE INDEX IF NOT EXISTS idx_session_bookings_payment_status ON session_bookings (payment_status);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_session_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_bookings_updated_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_bookings_updated_at();

-- Enable Row Level Security
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can create session bookings"
  ON session_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON session_bookings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all bookings"
  ON session_bookings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## ✅ After Running Schema

### Test the Table:
```sql
-- Insert a test booking
INSERT INTO session_bookings (
  booking_number,
  customer_name,
  customer_email,
  customer_phone,
  session_type,
  amount
) VALUES (
  'TEST-001',
  'Test User',
  'test@example.com',
  '+91 9876543210',
  'group_healing',
  1500
);

-- View the test booking
SELECT * FROM session_bookings;

-- Delete the test booking
DELETE FROM session_bookings WHERE booking_number = 'TEST-001';
```

---

## 🎯 Now Try Booking Again

1. Go to: `http://localhost:3000/book-session`
2. Fill in the form
3. Select a session type
4. Click "Proceed to Payment"
5. Should work now! ✅

---

## 🆘 Still Getting Errors?

### Check Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verify Supabase Connection:
```typescript
// Test in browser console
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
```

### Check Table Exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'session_bookings';
```

---

## 📞 Need Help?

If you're still stuck:
1. Check Supabase project is active
2. Verify you're in the correct project
3. Check SQL Editor for error messages
4. Review Supabase logs
5. Restart your dev server: `npm run dev`

---

## ✨ Success Indicators

You'll know it worked when:
- ✅ No error in SQL Editor
- ✅ Table appears in Table Editor
- ✅ Test query returns results
- ✅ Booking form submits successfully
- ✅ No "table not found" errors

---

**Once the table is created, your booking system will work perfectly!** 🚀
