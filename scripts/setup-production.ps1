# ICCT Smart Attendance System - Production Setup Script (PowerShell)
Write-Host " Setting up ICCT Smart Attendance System for Production..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
 Write-Host " Creating .env.local file..." -ForegroundColor Yellow
 Copy-Item "env.template" ".env.local"
 Write-Host " Created .env.local from template" -ForegroundColor Green
 Write-Host " Please update .env.local with your actual values" -ForegroundColor Yellow
}

# Generate secure secrets
Write-Host " Generating secure secrets..." -ForegroundColor Yellow

# Generate JWT Secret
$JWT_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content ".env.local" "JWT_SECRET=$JWT_SECRET"

# Generate NextAuth Secret
$NEXTAUTH_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content ".env.local" "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"

# Generate Session Secret
$SESSION_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content ".env.local" "SESSION_SECRET=$SESSION_SECRET"

# Generate Cookie Secret
$COOKIE_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content ".env.local" "COOKIE_SECRET=$COOKIE_SECRET"

# Generate CSRF Secret
$CSRF_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content ".env.local" "CSRF_SECRET=$CSRF_SECRET"

Write-Host " Generated secure secrets" -ForegroundColor Green

# Install dependencies
Write-Host " Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host " Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run database migrations
Write-Host " Running database migrations..." -ForegroundColor Yellow
try {
 npx prisma migrate deploy
 Write-Host " Database migrations completed" -ForegroundColor Green
} catch {
 Write-Host " Database not available, skipping migrations" -ForegroundColor Yellow
}

Write-Host " Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host " Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your actual service URLs" -ForegroundColor White
Write-Host "2. Set up external services (database, Redis, MQTT)" -ForegroundColor White
Write-Host "3. Configure environment variables in Vercel" -ForegroundColor White
Write-Host "4. Deploy to Vercel" -ForegroundColor White
Write-Host ""
Write-Host " For local development:" -ForegroundColor Cyan
Write-Host " docker-compose up -d" -ForegroundColor White
Write-Host " docker-compose -f docker-mqtt.yml up -d" -ForegroundColor White
Write-Host " npm run dev" -ForegroundColor White