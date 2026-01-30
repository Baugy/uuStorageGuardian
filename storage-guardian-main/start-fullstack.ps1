# Start Full Stack Application (Backend + Frontend)
# This script starts both the Spring Boot backend and React frontend

Write-Host "=== Starting Full Stack Application ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running (needed for PostgreSQL and InfluxDB)
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "⚠️  Docker Desktop is not running. Starting it..." -ForegroundColor Yellow
    Start-Process "Docker Desktop"
    Write-Host "Waiting for Docker to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "✓ Docker Desktop is running" -ForegroundColor Green
}

# Check Java
Write-Host ""
Write-Host "Checking Java..." -ForegroundColor Yellow
$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    # Try to find Java
    $javaPath = Get-Command java -ErrorAction SilentlyContinue
    if ($javaPath) {
        $javaHome = Split-Path (Split-Path $javaPath.Path)
        $env:JAVA_HOME = $javaHome
        $env:Path = "$javaHome\bin;$env:Path"
        Write-Host "✓ Found Java at: $javaHome" -ForegroundColor Green
    } else {
        Write-Host "❌ Java not found! Please install Java 21." -ForegroundColor Red
        Write-Host "   Download from: https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✓ JAVA_HOME is set: $javaHome" -ForegroundColor Green
}

# Start Backend
Write-Host ""
Write-Host "=== Starting Backend (Spring Boot) ===" -ForegroundColor Cyan
Write-Host "Backend will run on: http://localhost:8082" -ForegroundColor Yellow
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "box-manager-core"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '=== Backend Server ===' -ForegroundColor Cyan; Write-Host 'Starting Spring Boot on http://localhost:8082...' -ForegroundColor Yellow; Write-Host ''; if (`$env:JAVA_HOME) { `$env:Path = `"`$env:JAVA_HOME\bin;`$env:Path`" }; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "✓ Backend starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Start Frontend
Write-Host ""
Write-Host "=== Starting Frontend (React/Vite) ===" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "storage-guardian-main"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Check .env file
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
}

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '=== Frontend Dev Server ===' -ForegroundColor Cyan; Write-Host 'Starting Vite on http://localhost:8080...' -ForegroundColor Yellow; Write-Host ''; npm run dev" -WindowStyle Normal

Write-Host "✓ Frontend starting in new window..." -ForegroundColor Green

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8082" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "Wait for both to finish starting, then open:" -ForegroundColor Yellow
Write-Host "  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
