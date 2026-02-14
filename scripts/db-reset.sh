#!/usr/bin/env bash
# WriteRight SG — Reset local database (macOS/Linux)
# Drops all tables, re-runs migrations, seeds data
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🗄️  Resetting WriteRight SG local database..."
echo "⚠️  This will DELETE all local data!"
echo ""

read -p "Continue? (y/N) " confirm
if [[ "$confirm" != [yY] ]]; then
  echo "Cancelled."
  exit 0
fi

cd "$PROJECT_DIR"

if command -v supabase >/dev/null 2>&1; then
  echo "Resetting Supabase..."
  supabase db reset
  echo ""
  echo "✅ Database reset complete. Migrations applied + seeded."
else
  echo "❌ Supabase CLI not found."
  echo "   Install: brew install supabase/tap/supabase"
  exit 1
fi
