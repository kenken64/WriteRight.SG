#!/usr/bin/env bash
# WriteRight SG — Check dev environment status (macOS/Linux)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_DIR="$PROJECT_DIR/.pids"

echo "📊 WriteRight SG — Development Status"
echo ""

# Check Next.js
if [ -f "$PID_DIR/next.pid" ] && kill -0 "$(cat "$PID_DIR/next.pid")" 2>/dev/null; then
  echo "   🌐 Next.js:    ✅ Running (PID: $(cat "$PID_DIR/next.pid")) → http://localhost:3000"
elif lsof -ti:3000 >/dev/null 2>&1; then
  echo "   🌐 Next.js:    ✅ Running (port 3000) → http://localhost:3000"
else
  echo "   🌐 Next.js:    ❌ Stopped"
fi

# Check Supabase
if command -v supabase >/dev/null 2>&1 && supabase status >/dev/null 2>&1; then
  echo "   🗄️  Supabase:   ✅ Running → http://localhost:54323"
else
  echo "   🗄️  Supabase:   ❌ Stopped"
fi

# Check .env.local
if [ -f "$PROJECT_DIR/.env.local" ]; then
  echo "   📄 .env.local:  ✅ Found"
  # Check key vars
  grep -q "OPENAI_API_KEY=sk-" "$PROJECT_DIR/.env.local" && echo "   🔑 OpenAI Key:  ✅ Set" || echo "   🔑 OpenAI Key:  ❌ Missing"
  grep -q "NEXT_PUBLIC_SUPABASE_URL=http" "$PROJECT_DIR/.env.local" && echo "   🔑 Supabase:    ✅ Set" || echo "   🔑 Supabase:    ⚠️  Not configured"
  grep -q "STRIPE_SECRET_KEY=sk_" "$PROJECT_DIR/.env.local" && echo "   🔑 Stripe:      ✅ Set" || echo "   🔑 Stripe:      ⚠️  Not configured"
else
  echo "   📄 .env.local:  ❌ Missing"
fi

echo ""
