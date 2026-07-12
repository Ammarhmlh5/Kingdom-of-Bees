# Kingdom of Bees - Development Server Startup Script
# Creates .bat files to run servers (more reliable from Desktop shortcut)

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Admin
)

$startAll = -not ($Backend -or $Frontend -or $Admin)

# Define project root - hardcoded for reliability
$projectRoot = "C:\Kingdom-of-Bees"

Write-Host "========================================"
Write-Host "  Kingdom of Bees - Dev Server Startup"
Write-Host "========================================"
Write-Host ""
Write-Host "Project: $projectRoot"

# Create startup script for a server
function Create-ServerScript {
    param([string]$Name, [string]$Path, [string]$Command, [string]$Port)
    
    $batContent = @"
@echo off
title $Name - Port $Port
cd /d "$Path"
echo ========================================
echo Starting $Name on port $Port...
echo ========================================
echo.
$Command
echo.
echo Server stopped. Press any key to close...
pause >nul
"@
    
    $batFile = "$env:TEMP\kob_$($Name.Replace(' ',''))_start.bat"
    $batContent | Out-File -FilePath $batFile -Encoding ASCII
    
    Write-Host "Starting $Name on port $Port..."
    Start-Process cmd -ArgumentList "/c `"$batFile`"" -WindowStyle Normal
    Write-Host "OK: $Name started"
}

# Paths
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\frontend-web"
$adminPath = "$projectRoot\admin-panel"

# Start selected servers
if ($startAll -or $Backend) {
    Create-ServerScript -Name "Backend" -Path $backendPath -Command "npm run dev" -Port "4000"
    Start-Sleep 2
}

if ($startAll -or $Frontend) {
    Create-ServerScript -Name "Frontend" -Path $frontendPath -Command "npm run dev" -Port "5173"
    Start-Sleep 2
}

if ($startAll -or $Admin) {
    Create-ServerScript -Name "Admin" -Path $adminPath -Command "npm run dev" -Port "5174"
    Start-Sleep 2
}

Write-Host ""
Write-Host "========================================"
Write-Host "Servers Started!"
Write-Host "========================================"
Write-Host "Backend:     http://localhost:4000"
Write-Host "Frontend:    http://localhost:5173"
Write-Host "Admin:       http://localhost:5174"
Write-Host ""
Write-Host "Each server is running in its own window."
Write-Host "Close the windows to stop the servers."
Write-Host ""