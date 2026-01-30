# Start Backend with Dev Profile (No Authentication)
Write-Host "=== Starting Backend Server (Dev Mode - No Auth) ===" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "."
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

# Set Java environment if needed
if ($env:JAVA_HOME) {
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    Write-Host "✓ Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️  JAVA_HOME not set. Trying to find Java..." -ForegroundColor Yellow
    $javaPath = Get-Command java -ErrorAction SilentlyContinue
    if ($javaPath) {
        $javaHome = Split-Path (Split-Path $javaPath.Path)
        $env:JAVA_HOME = $javaHome
        $env:Path = "$javaHome\bin;$env:Path"
        Write-Host "✓ Found Java at: $javaHome" -ForegroundColor Green
    } else {
        Write-Host "❌ Java not found! Please install Java 21." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Starting Spring Boot backend on http://localhost:8082 (DEV PROFILE - No Auth)..." -ForegroundColor Yellow
Write-Host ""

cd $backendPath
$env:SPRING_PROFILES_ACTIVE = "dev"
.\mvnw.cmd spring-boot:run
