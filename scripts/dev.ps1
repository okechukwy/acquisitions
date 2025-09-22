# Development startup script for Acquisition App with Neon Local
# PowerShell version for Windows

Write-Host "Starting Acquisition App in Development Mode" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if .env.development exists
if (-not (Test-Path ".env.development")) {
    Write-Host "Error: .env.development file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.development from the template and update with your Neon credentials." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Create .neon_local directory if it doesn't exist
if (-not (Test-Path ".neon_local")) {
    New-Item -ItemType Directory -Path ".neon_local" -Force | Out-Null
    Write-Host "Created .neon_local directory" -ForegroundColor Green
}

# Add .neon_local to .gitignore if not already present
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
    if (-not $gitignoreContent.Contains(".neon_local/")) {
        Add-Content -Path ".gitignore" -Value ".neon_local/"
        Write-Host "Added .neon_local/ to .gitignore" -ForegroundColor Green
    }
}

Write-Host "Building and starting development containers..." -ForegroundColor Cyan
Write-Host "- Neon Local proxy will create an ephemeral database branch" -ForegroundColor Gray
Write-Host "- Application will run with hot reload enabled" -ForegroundColor Gray
Write-Host ""

# Clean up any existing containers
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
$cleanupResult = docker-compose -f docker-compose.dev.yml down --remove-orphans 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Cleanup completed" -ForegroundColor Green
}

# Start development environment
Write-Host "Starting development environment..." -ForegroundColor Cyan
$startResult = docker-compose --env-file .env.development -f docker-compose.dev.yml up --build -d 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Development environment started successfully" -ForegroundColor Green
} else {
    Write-Host "Error starting development environment:" -ForegroundColor Red
    Write-Host $startResult -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check container status
Write-Host "Checking container status..." -ForegroundColor Cyan
$containerStatus = docker-compose -f docker-compose.dev.yml ps
Write-Host $containerStatus

Write-Host ""
Write-Host "Development environment is ready!" -ForegroundColor Green
Write-Host "Application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Database: postgres://neon:npg@localhost:5432/neondb" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "- View logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Gray
Write-Host "- Stop environment: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host "- Database migrations: docker-compose -f docker-compose.dev.yml exec app npm run db:migrate" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the environment, run: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
