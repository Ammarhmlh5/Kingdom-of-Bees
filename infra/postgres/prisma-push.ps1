# prisma-push.ps1
# Run this after Postgres is running to push schema.
param()
$platformPath = Join-Path $PSScriptRoot '..\..\packages\db\packages\platform'
if (-not (Test-Path $platformPath)) { Write-Output "Platform path not found: $platformPath"; exit 1 }
Push-Location $platformPath
Write-Output "Running: npx prisma db push --accept-data-loss"
npx prisma db push --accept-data-loss
Pop-Location
