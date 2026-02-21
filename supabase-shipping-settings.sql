-- Shipping settings table
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cost_per_kg DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 500.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default shipping settings
INSERT INTO shipping_settings (cost_per_kg, free_shipping_threshold)
VALUES (50.00, 500.00)
ON CONFLICT DO NOTHING;

-- Create function to get shipping settings
CREATE OR REPLACE FUNCTION get_shipping_settings()
RETURNS TABLE (
  cost_per_kg DECIMAL(10,2),
  free_shipping_threshold DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.cost_per_kg, s.free_shipping_threshold
  FROM shipping_settings s
  ORDER BY s.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
