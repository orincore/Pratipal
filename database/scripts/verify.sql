-- ============================================
-- DATABASE VERIFICATION SCRIPT
-- Run this to check if all tables exist
-- ============================================

\echo '🔍 Verifying Pratipal Database Setup'
\echo '===================================='
\echo ''

-- Check all tables exist
\echo '📊 Checking tables...'
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'products', 'categories', 'product_variants',
      'orders', 'order_items', 'customers', 'customer_addresses',
      'cart_items', 'landing_pages', 'media', 'invitation_requests',
      'auth_users', 'shipping_settings', 'hero_sections', 'session_bookings'
    ) THEN '✓'
    ELSE '?'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

\echo ''
\echo '📈 Table counts:'

-- Count records in each table
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'hero_sections', COUNT(*) FROM hero_sections
UNION ALL
SELECT 'session_bookings', COUNT(*) FROM session_bookings
UNION ALL
SELECT 'shipping_settings', COUNT(*) FROM shipping_settings
ORDER BY table_name;

\echo ''
\echo '✅ Verification complete!'
