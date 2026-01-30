# Start Frontend Only (React/Vite)
Write-Host "=== Starting Frontend Dev Server ===" -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "storage-guardian-main"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Check/create .env file
$envFile = Join-Path $frontendPath ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  .env file not found. Creating it..." -ForegroundColor Yellow
    @"
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✓ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    Write-Host "Contents:" -ForegroundColor Cyan
    Get-Content $envFile
}

Write-Host ""
Write-Host "Starting Vite dev server on http://localhost:8080..." -ForegroundColor Yellow
Write-Host ""

cd $frontendPath
npm run dev
