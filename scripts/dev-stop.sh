#!/usr/bin/env bash
# WriteRight SG — Stop local development (macOS/Linux)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_DIR="$PROJECT_DIR/.pids"

echo "🛑 Stopping WriteRight SG development environment..."

# Stop Next.js
if [ -f "$PID_DIR/next.pid" ]; then
  NEXT_PID=$(cat "$PID_DIR/next.pid")
  if kill -0 "$NEXT_PID" 2>/dev/null; then
    # Kill the entire process group to include child processes
    kill -- -"$NEXT_PID" 2>/dev/null || kill "$NEXT_PID" 2>/dev/null
    echo "   ✅ Next.js stopped (PID: $NEXT_PID)"
  else
    echo "   ⚠️  Next.js was not running"
  fi
  rm -f "$PID_DIR/next.pid"
fi
# Always clean up port 3005 in case orphan child processes survived
lsof -ti:3005 | xargs kill -9 2>/dev/null && echo "   ✅ Cleaned up orphan process on port 3005" || true

# Stop Supabase
if [ -f "$PID_DIR/supabase.pid" ]; then
  rm -f "$PID_DIR/supabase.pid"
fi
if command -v supabase >/dev/null 2>&1; then
  cd "$PROJECT_DIR" && supabase stop 2>/dev/null && echo "   ✅ Supabase stopped" || echo "   ⚠️  Supabase was not running"
fi

# Cleanup
rm -rf "$PID_DIR"

echo ""
echo "✅ All services stopped."
