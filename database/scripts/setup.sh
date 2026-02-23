#!/bin/bash
# Pratipal Database Setup Script (Unix/Mac/Git Bash)

set -e

echo "🚀 Pratipal Database Setup"
echo "=========================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "📦 Install it with: npm install -g supabase"
    echo "📖 Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if .env file exists
if [ ! -f "../../.env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Create .env with your Supabase credentials:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_key"
    exit 1
fi

echo "✓ Environment file found"
echo ""

# Load environment variables
source ../../.env

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing Supabase credentials in .env"
    exit 1
fi

echo "✓ Credentials loaded"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')

echo "📊 Running migrations..."
echo ""

# Run each migration
for migration in ../migrations/00*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "⏳ Running $filename..."
        
        supabase db push --db-url "postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.$PROJECT_REF.supabase.co:5432/postgres" --file "$migration"
        
        if [ $? -eq 0 ]; then
            echo "✓ $filename completed"
        else
            echo "❌ $filename failed"
            exit 1
        fi
        echo ""
    fi
done

echo "✅ Database setup complete!"
echo ""
echo "🔍 Verify your setup:"
echo "   supabase db diff"
echo ""
echo "🌐 Or visit your Supabase dashboard:"
echo "   $NEXT_PUBLIC_SUPABASE_URL"
