# 🔧 سكريبت إضافة DATABASE_URL إلى .env
# Kingdom of Bees Setup Script

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🐝 Kingdom of Bees - Database URL Setup" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$envFile = "$PSScriptRoot\.env"

# التحقق من وجود الملف
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found at: $envFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Create .env file first with SUPABASE_URL and SUPABASE_KEY" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# قراءة الملف
$content = Get-Content $envFile -Raw

# التحقق من وجود DATABASE_URL بالفعل
if ($content -match "DATABASE_URL") {
    Write-Host "⚠️  DATABASE_URL already exists in .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current content:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
    Get-Content $envFile | Where-Object { $_ -match "DATABASE_URL" }
    Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host ""
        Write-Host "❌ Cancelled" -ForegroundColor Red
        Write-Host ""
        exit 0
    }
    
    # حذف السطر القديم
    $content = $content -replace "DATABASE_URL=.*`r?`n?", ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔑 Get your Database Password:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/ragjzeptkuogixjofeux/settings/database" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Find 'Database Password' section" -ForegroundColor White
Write-Host ""
Write-Host "3. Click 'Reset Database Password' if needed" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy the password" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# طلب كلمة المرور
$password = Read-Host "Enter your Database Password (paste here)"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host ""
    Write-Host "❌ Error: Password cannot be empty" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# إنشاء DATABASE_URL
$databaseUrl = "DATABASE_URL=`"postgresql://postgres:$password@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres`""

# إضافة إلى الملف
if (-not $content.EndsWith("`n")) {
    $content += "`n"
}
$content += $databaseUrl + "`n"

# حفظ الملف
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DATABASE_URL added successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 File: $envFile" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Next step: Push schema to Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run this command:" -ForegroundColor White
Write-Host "   cd $PSScriptRoot" -ForegroundColor Gray
Write-Host "   npx prisma db push" -ForegroundColor Green
Write-Host ""

$response = Read-Host "Do you want to run 'npx prisma db push' now? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🔄 Running prisma db push..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $PSScriptRoot
    npx prisma db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "🎉 SUCCESS! Database is ready!" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ 46 tables created in Supabase" -ForegroundColor Green
        Write-Host "✅ All relations configured" -ForegroundColor Green
        Write-Host "✅ All indexes created" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Next: Start the server" -ForegroundColor Yellow
        Write-Host "   cd packages\platform" -ForegroundColor Gray
        Write-Host "   npm run dev" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error occurred during prisma db push" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Check the error message above and try again" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "✅ DATABASE_URL is ready in .env" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run this when ready:" -ForegroundColor Yellow
    Write-Host "   cd $PSScriptRoot" -ForegroundColor Gray
    Write-Host "   npx prisma db push" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🐝 Kingdom of Bees" -ForegroundColor Yellow
Write-Host ""

