# WriteRight SG — Reset local database (Windows PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Write-Host "🗄️  Resetting WriteRight SG local database..." -ForegroundColor Cyan
Write-Host "⚠️  This will DELETE all local data!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled."
    exit 0
}

Push-Location $ProjectDir

if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "Resetting Supabase..."
    supabase db reset
    Write-Host ""
    Write-Host "✅ Database reset complete. Migrations applied + seeded." -ForegroundColor Green
} else {
    Write-Host "❌ Supabase CLI not found." -ForegroundColor Red
    Write-Host "   Install: scoop install supabase"
    exit 1
}

Pop-Location
