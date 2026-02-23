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
