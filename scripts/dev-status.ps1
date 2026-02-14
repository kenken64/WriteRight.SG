# WriteRight SG — Check dev environment status (Windows PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$PidDir = Join-Path $ProjectDir ".pids"

Write-Host "📊 WriteRight SG — Development Status" -ForegroundColor Cyan
Write-Host ""

# Check Next.js
$NextProc = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($NextProc) {
    Write-Host "   🌐 Next.js:    ✅ Running → http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "   🌐 Next.js:    ❌ Stopped" -ForegroundColor Red
}

# Check Supabase
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    $SupaStatus = supabase status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   🗄️  Supabase:   ✅ Running → http://localhost:54323" -ForegroundColor Green
    } else {
        Write-Host "   🗄️  Supabase:   ❌ Stopped" -ForegroundColor Red
    }
} else {
    Write-Host "   🗄️  Supabase:   ⚠️  CLI not installed" -ForegroundColor Yellow
}

# Check .env.local
$EnvFile = Join-Path $ProjectDir ".env.local"
if (Test-Path $EnvFile) {
    Write-Host "   📄 .env.local:  ✅ Found" -ForegroundColor Green
    $EnvContent = Get-Content $EnvFile -Raw
    if ($EnvContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "   🔑 OpenAI Key:  ✅ Set" -ForegroundColor Green
    } else {
        Write-Host "   🔑 OpenAI Key:  ❌ Missing" -ForegroundColor Red
    }
    if ($EnvContent -match "NEXT_PUBLIC_SUPABASE_URL=http") {
        Write-Host "   🔑 Supabase:    ✅ Set" -ForegroundColor Green
    } else {
        Write-Host "   🔑 Supabase:    ⚠️  Not configured" -ForegroundColor Yellow
    }
    if ($EnvContent -match "STRIPE_SECRET_KEY=sk_") {
        Write-Host "   🔑 Stripe:      ✅ Set" -ForegroundColor Green
    } else {
        Write-Host "   🔑 Stripe:      ⚠️  Not configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "   📄 .env.local:  ❌ Missing" -ForegroundColor Red
}

Write-Host ""
