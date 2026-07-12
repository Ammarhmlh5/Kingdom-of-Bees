# Kingdom of Bees - Setup Check Script
# يتحقق من جاهزية النظام للتشغيل

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Kingdom of Bees - Setup Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js not found!" -ForegroundColor Red
    $allGood = $false
}

# 2. Check npm
Write-Host "2. Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm not found!" -ForegroundColor Red
    $allGood = $false
}

# 3. Check .env file
Write-Host "3. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✓ .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "\[YOUR_PASSWORD\]") {
        Write-Host "   ⚠ WARNING: .env contains placeholder password!" -ForegroundColor Yellow
        Write-Host "   → Please update DATABASE_URL with actual password" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "   ✓ .env appears to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ .env file not found!" -ForegroundColor Red
    $allGood = $false
}

# 4. Check node_modules
Write-Host "4. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ node_modules not found - run: npm install" -ForegroundColor Yellow
    $allGood = $false
}

# 5. Check Prisma Client
Write-Host "5. Checking Prisma Client..." -ForegroundColor Yellow
if (Test-Path "node_modules/@prisma/client") {
    Write-Host "   ✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Prisma Client not found - run: npx prisma generate" -ForegroundColor Yellow
    $allGood = $false
}

# 6. Check Schema
Write-Host "6. Checking Schema..." -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    $schemaLines = (Get-Content "prisma/schema.prisma" | Measure-Object -Line).Lines
    Write-Host "   ✓ Schema exists ($schemaLines lines)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Schema not found!" -ForegroundColor Red
    $allGood = $false
}

# 7. Check Backend
Write-Host "7. Checking Backend..." -ForegroundColor Yellow
if (Test-Path "packages/platform/src/server.ts") {
    Write-Host "   ✓ Backend server exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend server not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npx prisma db push" -ForegroundColor White
    Write-Host "  2. cd packages/platform && npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠️ SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above, then:" -ForegroundColor Cyan
    Write-Host "  1. Update .env with actual password" -ForegroundColor White
    Write-Host "  2. Run: npm install" -ForegroundColor White
    Write-Host "  3. Run: npx prisma generate" -ForegroundColor White
    Write-Host "  4. Run: npx prisma db push" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more help, see: SETUP_FINAL.md" -ForegroundColor Gray

