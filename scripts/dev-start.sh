#!/usr/bin/env bash
# WriteRight SG — Start local development (macOS/Linux)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_DIR="$PROJECT_DIR/.pids"

mkdir -p "$PID_DIR"

echo "🚀 Starting WriteRight SG development environment..."
echo ""

# Check prerequisites
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not found. Install: npm i -g pnpm"; exit 1; }
command -v supabase >/dev/null 2>&1 || { echo "⚠️  Supabase CLI not found. Install: brew install supabase/tap/supabase"; }

# Check .env.local
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
  echo "❌ .env.local not found. Copy from .env.example:"
  echo "   cp .env.example .env.local"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "📦 Installing dependencies..."
  cd "$PROJECT_DIR" && pnpm install
fi

# Start Supabase local (if CLI available)
if command -v supabase >/dev/null 2>&1; then
  echo "🗄️  Starting Supabase local..."
  cd "$PROJECT_DIR" && supabase start &
  SUPABASE_PID=$!
  echo "$SUPABASE_PID" > "$PID_DIR/supabase.pid"
  echo "   Supabase PID: $SUPABASE_PID"
  
  # Wait for Supabase to be ready
  sleep 5
  echo "   Supabase dashboard: http://localhost:54323"
else
  echo "⚠️  Skipping Supabase local (CLI not installed)"
  echo "   Make sure NEXT_PUBLIC_SUPABASE_URL is set in .env.local"
fi

# Start Next.js dev server
echo "🌐 Starting Next.js dev server..."
cd "$PROJECT_DIR/apps/web" && pnpm dev &
NEXT_PID=$!
echo "$NEXT_PID" > "$PID_DIR/next.pid"
echo "   Next.js PID: $NEXT_PID"

echo ""
echo "✅ WriteRight SG is running!"
echo ""
echo "   🌐 App:        http://localhost:3005"
echo "   🗄️  Supabase:   http://localhost:54323"
echo "   📧 Inbucket:   http://localhost:54324 (email testing)"
echo ""
echo "   Stop with: ./scripts/dev-stop.sh"
echo ""

# Keep script running, forward signals
trap "bash $SCRIPT_DIR/dev-stop.sh" SIGINT SIGTERM
wait
