# WriteRight SG — Stop local development (Windows PowerShell)
$ErrorActionPreference = "SilentlyContinue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$PidDir = Join-Path $ProjectDir ".pids"

Write-Host "🛑 Stopping WriteRight SG development environment..." -ForegroundColor Yellow

# Stop Next.js
$NextJobFile = Join-Path $PidDir "next.jobid"
if (Test-Path $NextJobFile) {
    $JobId = Get-Content $NextJobFile
    Stop-Job -Id $JobId -ErrorAction SilentlyContinue
    Remove-Job -Id $JobId -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Next.js stopped (Job: $JobId)" -ForegroundColor Green
    Remove-Item $NextJobFile -Force
} else {
    # Fallback: kill by port
    $NextProc = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($NextProc) {
        Stop-Process -Id $NextProc -Force
        Write-Host "   ✅ Next.js stopped (port 3000)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Next.js was not running" -ForegroundColor Yellow
    }
}

# Stop Supabase
$SupabaseJobFile = Join-Path $PidDir "supabase.jobid"
if (Test-Path $SupabaseJobFile) {
    $JobId = Get-Content $SupabaseJobFile
    Stop-Job -Id $JobId -ErrorAction SilentlyContinue
    Remove-Job -Id $JobId -Force -ErrorAction SilentlyContinue
    Remove-Item $SupabaseJobFile -Force
}
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Push-Location $ProjectDir
    supabase stop 2>$null
    Write-Host "   ✅ Supabase stopped" -ForegroundColor Green
    Pop-Location
}

# Cleanup
if (Test-Path $PidDir) {
    Remove-Item $PidDir -Recurse -Force
}

Write-Host ""
Write-Host "✅ All services stopped." -ForegroundColor Green
