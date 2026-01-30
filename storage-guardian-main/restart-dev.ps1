# Script to properly restart the dev server with .env configuration
Write-Host "=== Restarting Frontend Dev Server ===" -ForegroundColor Cyan
Write-Host ""

# Stop all Node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✓ .env file found" -ForegroundColor Green
    Write-Host "Contents:" -ForegroundColor Cyan
    Get-Content .env
} else {
    Write-Host "✗ .env file NOT FOUND!" -ForegroundColor Red
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Green
Write-Host "After it starts, check the browser console for:" -ForegroundColor Cyan
Write-Host "  ✅ Using local backend: http://localhost:8082" -ForegroundColor Green
Write-Host ""

# Start the dev server
npm run dev
