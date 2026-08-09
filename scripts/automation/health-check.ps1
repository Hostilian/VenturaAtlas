# Venture Atlas OS — Local System Health Check Script
# =========================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $RepoRoot

Write-Host "=== Venture Atlas OS Health Diagnostics ===" -ForegroundColor Cyan

# 1. Test Node.js & npm environment
Write-Host "1. Testing Node environment..." -NoNewline
try {
    $nodeVer = node -v
    Write-Host " [OK] ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
}

# 2. Test Python environment
Write-Host "2. Testing Python environment..." -NoNewline
try {
    $pyVer = python --version
    Write-Host " [OK] ($pyVer)" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
}

# 3. Test Data Schema & Source Validation
Write-Host "3. Testing Data & Source Validation..." -NoNewline
try {
    $val = npm run validate:data 2>&1
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
}

# 4. Test Unit Test Suite
Write-Host "4. Running Unit Tests..." -NoNewline
try {
    $testOut = npm run test:unit 2>&1
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
}

# 5. Test Provider Routing Engine
Write-Host "5. Running Provider Routing Tests..." -NoNewline
try {
    $provOut = python scripts/test_providers_mock.py 2>&1
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
}

Write-Host "=== All Health Diagnostics Completed ===" -ForegroundColor Cyan
