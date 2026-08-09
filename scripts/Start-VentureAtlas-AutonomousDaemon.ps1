# Venture Atlas OS -- Autonomous Multi-Agent Idea Discovery Daemon (v2)
# 
# Bridges EUshop Multi-Provider Orchestrator pattern:
#   Tier 1: Hermes via Ollama (local, free)
#   Tier 2: OmniRoute -> OpenRouter (free tier)
#   Tier 3: FCC Claude (Anthropic Haiku, cheapest paid)
#   Tier 4: Own Orchestrator (rule-based, always available)
#   Tier 5: Anthropic Full (Claude Sonnet/Opus)

[CmdletBinding()]
param(
    [int]$IntervalSeconds  = 120,
    [int]$MaxIterations    = 10,
    [switch]$Rank,
    [switch]$Validate,
    [switch]$TestMode,
    [switch]$Parallel      = $true,
    [string]$EUshopPath    = "D:\CODING\eushop"
)

if ($env:DAEMON_INTERVAL_SECONDS -and -not $PSBoundParameters.ContainsKey('IntervalSeconds')) {
    $IntervalSeconds = [int]$env:DAEMON_INTERVAL_SECONDS
}
if ($env:DAEMON_MAX_ITERATIONS -and -not $PSBoundParameters.ContainsKey('MaxIterations')) {
    $MaxIterations = [int]$env:DAEMON_MAX_ITERATIONS
}

# Enable parallel AI execution across all providers simultaneously
$env:PARALLEL_AI_ORCHESTRATION = "1"
$env:IDEAS_PER_ITERATION       = "6"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

if ($TestMode) {
    $MaxIterations    = 2
    $IntervalSeconds  = 5
    $Rank             = $true
    Write-Host "TEST MODE: 2 iterations, 5s interval (PARALLEL AI ACTIVE)" -ForegroundColor Cyan
}

$LogDir = Join-Path $PSScriptRoot "..\.agent-state\logs"
if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}
$LogFile = Join-Path $LogDir "unattended-runner.log"

function Write-JsonLog {
    param([string]$Level, [string]$Msg, [hashtable]$Extra = @{})
    $Entry = @{
        ts        = [DateTime]::UtcNow.ToString("o")
        level     = $Level
        component = "va-daemon-ps1"
        msg       = $Msg
    }
    foreach ($k in $Extra.Keys) { $Entry[$k] = $Extra[$k] }
    $Line = $Entry | ConvertTo-Json -Compress
    try { Add-Content -LiteralPath $LogFile -Value $Line -ErrorAction SilentlyContinue } catch {}
    $colour = switch ($Level) {
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        "SUCCESS" { "Green" }
        "HEADER"  { "Cyan" }
        default   { "White" }
    }
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts][DAEMON][$Level] $Msg" -ForegroundColor $colour
}

function Invoke-PythonScript {
    param([string]$ScriptName, [string[]]$ScriptArgs = @())
    $ScriptPath = Join-Path $PSScriptRoot $ScriptName
    if (-not (Test-Path $ScriptPath)) {
        Write-JsonLog "ERROR" "Script not found: $ScriptPath"
        return 1
    }
    $Output = & python $ScriptPath @ScriptArgs 2>&1
    foreach ($line in $Output) {
        if ($line) { Write-JsonLog "INFO" "  [Engine] $line" }
    }
    return $LASTEXITCODE
}

# -- Banner --------------------------------------------------------------------
Write-JsonLog "HEADER" "=== Venture Atlas Autonomous Daemon v2 (Parallel AI) Starting ===" -Extra @{ maxIterations = $MaxIterations; intervalSeconds = $IntervalSeconds }

# -- Preflight checks ----------------------------------------------------------
# 1. EUshop orchestrator (optional, for cross-project state sync)
if (Test-Path "$EUshopPath\scripts\EUshop-Agent-Orchestrator.ps1") {
    Write-JsonLog "SUCCESS" "Connected to EUshop Multi-Provider Orchestrator at $EUshopPath"
} else {
    Write-JsonLog "WARN" "EUshop Orchestrator not found - running in standalone mode"
}

# 2. Python check
$PythonVersion = & python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-JsonLog "ERROR" "Python not found. Install Python 3.8+ first."
    exit 1
}
Write-JsonLog "INFO" "Python: $PythonVersion"

# 3. Ollama check (Hermes Tier 1)
try {
    $OllamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
    $ModelNames = ($OllamaCheck.models | ForEach-Object { $_.name }) -join ", "
    Write-JsonLog "SUCCESS" "Ollama available. Models: $ModelNames"
} catch {
    Write-JsonLog "WARN" "Ollama not available (Tier 1 disabled). Install from https://ollama.com"
}

# 4. API key checks
$AnthropicKey = $env:ANTHROPIC_API_KEYS
if (-not $AnthropicKey) { $AnthropicKey = $env:ANTHROPIC_API_KEY }

$OpenRouterKey = $env:OPENROUTER_API_KEYS
if (-not $OpenRouterKey) { $OpenRouterKey = $env:OPENROUTER_API_KEY }

if ($AnthropicKey -and $AnthropicKey -ne "sk-ant-...") {
    Write-JsonLog "SUCCESS" "Anthropic API key pool configured (FCC Claude + Full available)"
} else {
    Write-JsonLog "WARN" "No Anthropic key - FCC Claude (Tier 3) disabled. Set ANTHROPIC_API_KEY or ANTHROPIC_API_KEYS."
}

if ($OpenRouterKey -and $OpenRouterKey -ne "sk-or-...") {
    Write-JsonLog "SUCCESS" "OpenRouter key pool configured (OmniRoute/Tier 2 available)"
} else {
    Write-JsonLog "WARN" "No OpenRouter key - OmniRoute (Tier 2) disabled. Set OPENROUTER_API_KEY or OPENROUTER_API_KEYS."
}

# 5. Run provider health check via orchestrator
Write-JsonLog "INFO" "Running provider health check..."
Invoke-PythonScript "va_orchestrator.py" -ScriptArgs "--test"

Write-JsonLog "HEADER" "Daemon active - running up to $MaxIterations iterations every $($IntervalSeconds)s"

# -- Main Loop -----------------------------------------------------------------
for ($i = 1; $i -le $MaxIterations; $i++) {
    try {
        Write-Host "`n============================================================" -ForegroundColor Cyan
        Write-Host "  VENTURE ATLAS DAEMON (PARALLEL AI)  -  Run $i/$MaxIterations" -ForegroundColor Cyan
        Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "============================================================" -ForegroundColor Cyan

        Write-JsonLog "INFO" "Starting parallel discovery run $i of $MaxIterations" -Extra @{ iteration = $i }

        # Step 1: Idea discovery
        Write-JsonLog "INFO" "Running parallel idea generator..."
        $rc = Invoke-PythonScript "autonomous-idea-generator.py"
        if ($rc -eq 0) {
            Write-JsonLog "SUCCESS" "Idea generator complete"
        } else {
            Write-JsonLog "WARN" "Idea generator exited with code $rc (will continue next cycle)"
        }

        # Step 2: Validate staged (optional)
        if ($Validate) {
            Write-JsonLog "INFO" "Running validator on staged ideas..."
            Invoke-PythonScript "va-validator.py" -ScriptArgs "--staged"
        }

        # Step 3: Re-rank (optional)
        if ($Rank) {
            Write-JsonLog "INFO" "Updating rankings..."
            Invoke-PythonScript "va-ranker.py" -ScriptArgs "--update", "--top", "10"
        }

        Write-JsonLog "SUCCESS" "Run $i complete"
    } catch {
        $errStr = $_.Exception.Message
        Write-JsonLog "ERROR" "Daemon run $i encountered exception: $errStr - continuing next cycle"
    }

    if ($i -lt $MaxIterations) {
        Write-JsonLog "INFO" "Sleeping $IntervalSeconds seconds..."
        for ($s = $IntervalSeconds; $s -gt 0; $s -= 10) {
            Start-Sleep -Seconds ([Math]::Min(10, $s))
            if ($s -gt 10 -and $s % 30 -eq 0) {
                Write-Host "  Next run in ${s}s..." -ForegroundColor Gray
            }
        }
    }
}

Write-JsonLog "SUCCESS" "=== Venture Atlas Daemon finished ==="
Write-Host ""
Write-Host "All done! Check:" -ForegroundColor Green
Write-Host "  python scripts/review-staged-ideas.py" -ForegroundColor Green
Write-Host "  python scripts/va-ranker.py --top 20" -ForegroundColor Green
Write-Host "  python scripts/va-validator.py --staged" -ForegroundColor Green
