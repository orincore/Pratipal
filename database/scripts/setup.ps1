# Pratipal Database Setup Script (PowerShell/Windows)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Pratipal Database Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✓ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "📦 Install it with: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "📖 Or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env file exists
$envPath = "../../.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "📝 Create .env with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=your_url"
    Write-Host "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key"
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_service_key"
    exit 1
}

Write-Host "✓ Environment file found" -ForegroundColor Green
Write-Host ""

# Load environment variables
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

# Check if required variables are set
if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ Missing Supabase credentials in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Credentials loaded" -ForegroundColor Green
Write-Host ""

# Extract project ref from URL
$projectRef = ($env:NEXT_PUBLIC_SUPABASE_URL -replace 'https://([^.]+).*', '$1')

Write-Host "📊 Running migrations..." -ForegroundColor Cyan
Write-Host ""

# Get all migration files
$migrations = Get-ChildItem -Path "../migrations" -Filter "*.sql" | Where-Object { $_.Name -match '^00\d' } | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host "⏳ Running $($migration.Name)..." -ForegroundColor Yellow
    
    $dbUrl = "postgresql://postgres:$($env:SUPABASE_SERVICE_ROLE_KEY)@db.$projectRef.supabase.co:5432/postgres"
    
    # Read SQL file and execute
    $sql = Get-Content $migration.FullName -Raw
    
    try {
        # Use psql if available, otherwise use Supabase CLI
        if (Get-Command psql -ErrorAction SilentlyContinue) {
            $sql | psql $dbUrl
        } else {
            # Alternative: Use Supabase CLI
            supabase db execute --db-url $dbUrl --file $migration.FullName
        }
        
        Write-Host "✓ $($migration.Name) completed" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($migration.Name) failed: $_" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Verify your setup:" -ForegroundColor Cyan
Write-Host "   supabase db diff"
Write-Host ""
Write-Host "🌐 Or visit your Supabase dashboard:" -ForegroundColor Cyan
Write-Host "   $env:NEXT_PUBLIC_SUPABASE_URL"
