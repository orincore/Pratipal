#!/usr/bin/env node
/**
 * Simple Database Setup using Supabase Client
 * This bypasses psql and uses the Supabase JavaScript client
 */

const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🚀 Pratipal Database Setup (Simple Mode)', 'cyan');
  log('=========================================\n', 'cyan');
  
  // Check environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    log('❌ Missing Supabase credentials in .env', 'red');
    log('\nRequired:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('  SUPABASE_SECRET_KEY', 'yellow');
    process.exit(1);
  }
  
  log('✓ Environment loaded', 'green');
  log('', 'reset');
  log('⚠️  Note: This script requires manual SQL execution', 'yellow');
  log('', 'reset');
  log('📋 Please run these SQL files in Supabase SQL Editor:', 'cyan');
  log('', 'reset');
  
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^00[1-4].*\.sql$/))
    .sort();
  
  migrations.forEach((file, index) => {
    log(`  ${index + 1}. ${file}`, 'cyan');
  });
  
  log('', 'reset');
  log('📖 Instructions:', 'cyan');
  log('  1. Open https://supabase.com/dashboard', 'reset');
  log('  2. Go to SQL Editor', 'reset');
  log('  3. Copy/paste each file content and run', 'reset');
  log('', 'reset');
  log('💡 Or use Supabase CLI:', 'yellow');
  log('  npm install -g supabase', 'reset');
  log('  supabase login', 'reset');
  log('  supabase link --project-ref your-project-ref', 'reset');
  log('  supabase db push', 'reset');
  log('', 'reset');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
