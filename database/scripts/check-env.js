#!/usr/bin/env node
/**
 * Environment Variables Checker
 * Verifies all required Supabase credentials are present
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
  
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    // Skip empty lines and comments
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    // Match KEY=VALUE pattern (keys must start with letter/underscore)
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      if (key && value) {
        env[key] = value;
      }
    }
  });
  
  return env;
}

function checkEnv() {
  log('\n🔍 Checking Environment Variables', 'cyan');
  log('================================\n', 'cyan');
  
  const envPath = path.join(__dirname, '../../.env');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    log(`\n📝 Create .env file at: ${envPath}`, 'yellow');
    log('\nRequired variables:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    log('  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key');
    log('  SUPABASE_SECRET_KEY=your_service_role_key');
    return false;
  }
  
  log(`✓ .env file found at: ${envPath}`, 'green');
  log('');
  
  const env = loadEnv();
  
  const required = {
    'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': 'Supabase publishable/anon key',
    'SUPABASE_SECRET_KEY': 'Supabase service role key'
  };
  
  let allPresent = true;
  
  log('📋 Required Variables:', 'cyan');
  log('');
  
  for (const [key, description] of Object.entries(required)) {
    if (env[key]) {
      const value = env[key];
      const masked = value.length > 20 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
        : value;
      log(`  ✓ ${key}`, 'green');
      log(`    ${masked}`, 'reset');
      log(`    (${description})`, 'reset');
    } else {
      log(`  ✗ ${key} - MISSING`, 'red');
      log(`    (${description})`, 'yellow');
      allPresent = false;
    }
    log('');
  }
  
  if (!allPresent) {
    log('❌ Some required variables are missing!', 'red');
    log('\n📖 Get your credentials from:', 'yellow');
    log('   https://supabase.com/dashboard', 'cyan');
    log('   → Your Project → Settings → API', 'cyan');
    log('');
    log('📝 Add them to your .env file:', 'yellow');
    log(`   ${envPath}`, 'cyan');
    return false;
  }
  
  // Validate URL format
  if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    log('⚠️  NEXT_PUBLIC_SUPABASE_URL should start with https://', 'yellow');
  }
  
  // Check key formats
  if (env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_')) {
    log('⚠️  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY might be incorrect (should start with sb_)', 'yellow');
  }
  
  if (env.SUPABASE_SECRET_KEY && !env.SUPABASE_SECRET_KEY.startsWith('sb_')) {
    log('⚠️  SUPABASE_SECRET_KEY might be incorrect (should start with sb_)', 'yellow');
  }
  
  log('✅ All required environment variables are present!', 'green');
  log('\n🚀 You can now run:', 'cyan');
  log('   npm run db:setup', 'green');
  
  return true;
}

checkEnv();
