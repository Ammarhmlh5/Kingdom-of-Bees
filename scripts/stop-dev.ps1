# Kingdom of Bees - Stop Development Servers Script
# This script stops all running development servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kingdom of Bees - Stop Servers      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# FIXED: Find project root regardless of where script is run from
# ========================================

# Get script location
$scriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = Get-Location
}

# Navigate to script directory
try {
    Set-Location $scriptDir -ErrorAction Stop
} catch {
    Write-Host "❌ Cannot access script directory" -ForegroundColor Red
    exit 1
}

# Go up to project root
$rootDir = (Get-Item $scriptDir).Parent.FullName

Write-Host "✅ Project root: $rootDir" -ForegroundColor Green
Write-Host ""

function Stop-NodeServers {
    param([string]$Port, [string]$Name)
    
    # Find processes running on the port
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Where-Object { $_.State -eq "Listen" } | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($procId in $processes) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -match "node|npm") {
                Write-Host "🛑 Stopping $Name (PID: $procId)..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "✅ $Name stopped" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "⚪ $Name is not running on port $Port" -ForegroundColor Gray
    }
}

# Stop all servers
Write-Host "🧹 Checking for running servers..." -ForegroundColor Cyan
Write-Host ""

# Ports used by the project
Stop-NodeServers -Port 4000 -Name "Backend Server"
Stop-NodeServers -Port 5173 -Name "Frontend Web"
Stop-NodeServers -Port 5174 -Name "Admin Panel"

# Also kill any node processes running from project directories
if ($rootDir) {
    Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdLine -and $cmdLine -imatch [regex]::Escape($rootDir)) {
                Write-Host "🛑 Stopping node process $($_.Id)..." -ForegroundColor Yellow
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ All Servers Stopped!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""