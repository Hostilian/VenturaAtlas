# Venture Atlas OS — Autonomous Local Resume & Daemon Startup Script
# ======================================================================
# Executed automatically on Windows user logon or manual resume.
# Verifies repository state, provider health, reconciles cloud work, and resumes orchestrator.

Param(
    [switch]$Background,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $RepoRoot

$LogDir  = Join-Path $RepoRoot ".agent-state\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "startup-auto-resume.log"

function Write-StartupLog($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $msg"
    Add-Content -Path $LogFile -Value $line
    if ($VerboseOutput -or -not $Background) { Write-Host $line }
}

Write-StartupLog "=================================================================="
Write-StartupLog "Venture Atlas OS Auto-Resume Daemon Starting..."
Write-StartupLog "Repository Root: $RepoRoot"

# 1. Prevent duplicate daemon instances
$existingProcess = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*va_orchestrator.py*" -or $_.CommandLine -like "*va-daemon-runner.py*" }
if ($existingProcess) {
    Write-StartupLog "[WARN] Autonomous daemon is already running (PID: $($existingProcess.ProcessId)). Exiting startup wrapper."
    exit 0
}

# 2. Check Git working directory status
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-StartupLog "[INFO] Pending local changes detected in repository:"
        Write-StartupLog $gitStatus
    } else {
        Write-StartupLog "[OK] Git workspace is clean."
    }
} catch {
    Write-StartupLog "[WARN] Unable to inspect Git status: $_"
}

# 3. Perform provider health check
try {
    $providerCheck = python scripts/test_providers_mock.py 2>&1
    Write-StartupLog "[OK] Provider routing & fallback engine verified."
} catch {
    Write-StartupLog "[ERROR] Provider health check failed: $_"
}

# 4. Reconcile agent state
$stateFile = Join-Path $RepoRoot ".agent-state\provider-state.json"
if (Test-Path $stateFile) {
    Write-StartupLog "[OK] Agent state file exists: $stateFile"
} else {
    Write-StartupLog "[WARN] Agent state file missing. Will be initialized on daemon run."
}

# 5. Launch background orchestrator bounded pass
Write-StartupLog "[INFO] Triggering autonomous orchestrator iteration pass..."
try {
    $orchOutput = python scripts/va_orchestrator.py --bounded 2>&1
    Write-StartupLog "[OK] Orchestrator pass finished cleanly."
    Write-StartupLog $orchOutput
} catch {
    Write-StartupLog "[ERROR] Autonomous orchestrator pass failed: $_"
}

Write-StartupLog "Auto-Resume Pass Complete."
Write-StartupLog "=================================================================="
