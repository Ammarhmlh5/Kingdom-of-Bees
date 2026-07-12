# Kingdom of Bees - Setup Check Script
Write-Host "========================================"
Write-Host "   Kingdom of Bees - Setup Check"
Write-Host "========================================"
Write-Host ""

$allGood = $true

# 1. Node.js
Write-Host "1. Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Host "   OK - Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Node.js not found!" -ForegroundColor Red
    $allGood = $false
}

# 2. npm
Write-Host "2. Checking npm..."
try {
    $npmVersion = npm --version
    Write-Host "   OK - npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - npm not found!" -ForegroundColor Red
    $allGood = $false
}

# 3. .env
Write-Host "3. Checking .env file..."
if (Test-Path ".env") {
    Write-Host "   OK - .env exists" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "\[YOUR_PASSWORD\]") {
        Write-Host "   WARNING - Password not updated!" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "   OK - Password configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ERROR - .env not found!" -ForegroundColor Red
    $allGood = $false
}

# 4. Dependencies
Write-Host "4. Checking dependencies..."
if (Test-Path "node_modules") {
    Write-Host "   OK - Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   WARNING - Run: npm install" -ForegroundColor Yellow
    $allGood = $false
}

# 5. Prisma Client
Write-Host "5. Checking Prisma Client..."
if (Test-Path "node_modules/@prisma/client") {
    Write-Host "   OK - Prisma Client ready" -ForegroundColor Green
} else {
    Write-Host "   WARNING - Run: npx prisma generate" -ForegroundColor Yellow
    $allGood = $false
}

# 6. Schema
Write-Host "6. Checking Schema..."
if (Test-Path "prisma/schema.prisma") {
    $lines = (Get-Content "prisma/schema.prisma" | Measure-Object -Line).Lines
    Write-Host "   OK - Schema ready ($lines lines)" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Schema not found!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "========================================"

if ($allGood) {
    Write-Host "SUCCESS - All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. npx prisma db push"
    Write-Host "  2. cd packages/platform"
    Write-Host "  3. npm run dev"
} else {
    Write-Host "ATTENTION - Some checks failed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix issues then run:"
    Write-Host "  1. Update .env password"
    Write-Host "  2. npm install"
    Write-Host "  3. npx prisma generate"
    Write-Host "  4. npx prisma db push"
}

Write-Host "========================================"
Write-Host ""
Write-Host "See SETUP_FINAL.md for details"

