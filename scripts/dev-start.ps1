# WriteRight SG — Start local development (Windows PowerShell)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$PidDir = Join-Path $ProjectDir ".pids"

New-Item -ItemType Directory -Force -Path $PidDir | Out-Null

Write-Host "🚀 Starting WriteRight SG development environment..." -ForegroundColor Green
Write-Host ""

# Check prerequisites
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm not found. Install: npm i -g pnpm" -ForegroundColor Red
    exit 1
}

$HasSupabase = Get-Command supabase -ErrorAction SilentlyContinue

# Check .env.local
$EnvFile = Join-Path $ProjectDir ".env.local"
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ .env.local not found. Copy from .env.example:" -ForegroundColor Red
    Write-Host "   Copy-Item .env.example .env.local"
    exit 1
}

# Install dependencies if needed
$NodeModules = Join-Path $ProjectDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "📦 Installing dependencies..."
    Push-Location $ProjectDir
    pnpm install
    Pop-Location
}

# Start Supabase local
if ($HasSupabase) {
    Write-Host "🗄️  Starting Supabase local..."
    Push-Location $ProjectDir
    $SupabaseJob = Start-Job -ScriptBlock { 
        param($dir)
        Set-Location $dir
        supabase start 
    } -ArgumentList $ProjectDir
    $SupabaseJob.Id | Out-File (Join-Path $PidDir "supabase.jobid")
    Write-Host "   Supabase Job ID: $($SupabaseJob.Id)"
    Write-Host "   Supabase dashboard: http://localhost:54323"
    Pop-Location
} else {
    Write-Host "⚠️  Skipping Supabase local (CLI not installed)" -ForegroundColor Yellow
}

# Start Next.js dev server
Write-Host "🌐 Starting Next.js dev server..."
$WebDir = Join-Path $ProjectDir "apps\web"
$NextJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    pnpm dev
} -ArgumentList $WebDir
$NextJob.Id | Out-File (Join-Path $PidDir "next.jobid")
Write-Host "   Next.js Job ID: $($NextJob.Id)"

Write-Host ""
Write-Host "✅ WriteRight SG is running!" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐 App:        http://localhost:3000"
Write-Host "   🗄️  Supabase:   http://localhost:54323"
Write-Host "   📧 Inbucket:   http://localhost:54324 (email testing)"
Write-Host ""
Write-Host "   Stop with: .\scripts\dev-stop.ps1"
Write-Host ""
Write-Host "   View Next.js logs: Receive-Job $($NextJob.Id) -Keep"
Write-Host ""

# Wait for user to press Ctrl+C
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Forward Next.js output
        Receive-Job $NextJob.Id -ErrorAction SilentlyContinue
    }
} finally {
    & (Join-Path $ScriptDir "dev-stop.ps1")
}
