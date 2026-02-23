-- ============================================
-- PRATIPAL DATABASE - COMPLETE SETUP
-- Run this file to set up the entire database
-- ============================================

-- This file executes all migrations in order
-- You can run this via Supabase CLI or SQL Editor

\echo 'Starting Pratipal database setup...'

-- Migration 001: Initial Schema (Core Tables)
\echo 'Running 001_initial_schema.sql...'
\i 001_initial_schema.sql

-- Migration 002: Shipping Settings
\echo 'Running 002_shipping_settings.sql...'
\i 002_shipping_settings.sql

-- Migration 003: Hero Sections
\echo 'Running 003_hero_sections.sql...'
\i 003_hero_sections.sql

-- Migration 004: Session Bookings
\echo 'Running 004_session_bookings.sql...'
\i 004_session_bookings.sql

\echo 'Database setup complete!'
\echo 'Run verification queries to confirm all tables exist.'
