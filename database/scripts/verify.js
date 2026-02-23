#!/usr/bin/env node
/**
 * Database Verification Script
 * Checks if all tables exist and shows counts
 */

const fs = require('fs');
const path = require('path');

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

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return null;
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    // Skip empty lines and comments
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    // Match KEY=VALUE pattern
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  
  return env;
}

async function verifyDatabase(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SECRET_KEY;
  
  const expectedTables = [
    'products', 'categories', 'product_variants',
    'orders', 'order_items', 'customers', 'customer_addresses',
    'cart_items', 'landing_pages', 'media', 'invitation_requests',
    'auth_users', 'shipping_settings', 'hero_sections', 'session_bookings'
  ];
  
  log('\n🔍 Verifying Database Setup', 'cyan');
  log('============================\n', 'cyan');
  
  // Check tables via Supabase REST API
  log('📊 Checking tables...\n', 'cyan');
  
  const results = {
    found: [],
    missing: [],
    counts: {}
  };
  
  for (const table of expectedTables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count`, {
        method: 'HEAD',
        headers: {
          'apikey': env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      
      if (response.ok) {
        results.found.push(table);
        
        // Get count
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count`, {
          headers: {
            'apikey': env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'count=exact'
          }
        });
        
        const countHeader = countResponse.headers.get('content-range');
        const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
        results.counts[table] = count;
        
        log(`  ✓ ${table.padEnd(25)} (${count} rows)`, 'green');
      } else {
        results.missing.push(table);
        log(`  ✗ ${table.padEnd(25)} MISSING`, 'red');
      }
    } catch (error) {
      results.missing.push(table);
      log(`  ✗ ${table.padEnd(25)} ERROR: ${error.message}`, 'red');
    }
  }
  
  log('\n📈 Summary:', 'cyan');
  log(`  Found: ${results.found.length}/${expectedTables.length}`, results.found.length === expectedTables.length ? 'green' : 'yellow');
  log(`  Missing: ${results.missing.length}`, results.missing.length === 0 ? 'green' : 'red');
  
  if (results.missing.length > 0) {
    log('\n⚠️  Missing tables:', 'yellow');
    results.missing.forEach(table => log(`  - ${table}`, 'yellow'));
    log('\n💡 Run: npm run db:setup', 'cyan');
  } else {
    log('\n✅ All tables exist!', 'green');
    
    // Check for expected data
    log('\n📊 Data Check:', 'cyan');
    if (results.counts.hero_sections === 3) {
      log('  ✓ hero_sections has 3 default entries', 'green');
    } else if (results.counts.hero_sections === 0) {
      log('  ⚠️  hero_sections is empty (expected 3 defaults)', 'yellow');
    }
    
    if (results.counts.products > 0) {
      log(`  ✓ ${results.counts.products} products found`, 'green');
    } else {
      log('  ℹ️  No products yet (add via admin panel)', 'cyan');
    }
  }
  
  log('');
}

async function main() {
  const env = loadEnv();
  
  if (!env) {
    log('❌ .env file not found!', 'red');
    process.exit(1);
  }
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    log('❌ Missing Supabase credentials in .env', 'red');
    process.exit(1);
  }
  
  await verifyDatabase(env);
}

main().catch(error => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
