#!/usr/bin/env node
/**
 * Pratipal Database Setup Script
 * Works on Windows, Mac, Linux
 * 
 * Usage: node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
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

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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

async function runMigrations(env) {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^00\d.*\.sql$/))
    .sort();
  
  const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
  const dbUrl = `postgresql://postgres:${env.SUPABASE_SECRET_KEY}@db.${projectRef}.supabase.co:5432/postgres`;
  
  log('\n📊 Running migrations...\n', 'cyan');
  
  for (const migration of migrations) {
    log(`⏳ Running ${migration}...`, 'yellow');
    
    const sqlPath = path.join(migrationsDir, migration);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    try {
      // Use psql if available
      const { execSync } = require('child_process');
      execSync(`psql "${dbUrl}" -f "${sqlPath}"`, { 
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: env.SUPABASE_SECRET_KEY }
      });
      
      log(`✓ ${migration} completed\n`, 'green');
    } catch (error) {
      // If psql not available, try using fetch API
      log(`⚠️  psql not found, using HTTP API...`, 'yellow');
      
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SECRET_KEY}`
          },
          body: JSON.stringify({ query: sql })
        });
        
        if (response.ok) {
          log(`✓ ${migration} completed\n`, 'green');
        } else {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      } catch (apiError) {
        log(`❌ ${migration} failed: ${apiError.message}`, 'red');
        process.exit(1);
      }
    }
  }
}

async function main() {
  log('🚀 Pratipal Database Setup', 'cyan');
  log('==========================\n', 'cyan');
  
  // Check Supabase CLI
  if (!checkSupabaseCLI()) {
    log('⚠️  Supabase CLI not found (optional)', 'yellow');
    log('📦 Install with: npm install -g supabase\n', 'yellow');
  } else {
    log('✓ Supabase CLI found', 'green');
  }
  
  // Load environment
  const env = loadEnv();
  if (!env) {
    log('❌ .env file not found!', 'red');
    log('📝 Create .env with your Supabase credentials:', 'yellow');
    log('   NEXT_PUBLIC_SUPABASE_URL=your_url');
    log('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key');
    log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key');
    process.exit(1);
  }
  
  log('✓ Environment file found', 'green');
  
  // Check credentials
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    log('❌ Missing Supabase credentials in .env', 'red');
    log('Required:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'yellow');
    log('  SUPABASE_SECRET_KEY', 'yellow');
    process.exit(1);
  }
  
  log('✓ Credentials loaded', 'green');
  
  // Run migrations
  await runMigrations(env);
  
  log('✅ Database setup complete!\n', 'green');
  log('🔍 Verify your setup:', 'cyan');
  log('   supabase db diff\n');
  log('🌐 Or visit your Supabase dashboard:', 'cyan');
  log(`   ${env.NEXT_PUBLIC_SUPABASE_URL}`);
}

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
