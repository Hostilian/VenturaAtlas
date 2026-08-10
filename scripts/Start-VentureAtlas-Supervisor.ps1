param(
    [int]$IntervalSeconds = 120,
    [int]$MaxConcurrency = 3,
    [ValidateRange(0, 3)][int]$MaxCostClass = 1,
    [ValidateRange(1, 8)][int]$ProviderFanout = 2,
    [string]$PythonPath = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $PythonPath) {
    $PythonPath = (Get-Command python -ErrorAction Stop).Source
}
$env:PARALLEL_AI_ORCHESTRATION = "1"
$env:VA_PROVIDER_FANOUT = [string]$ProviderFanout
$env:VA_MAX_CONCURRENCY = [string]$MaxConcurrency
$env:VA_MAX_COST_CLASS = [string]$MaxCostClass
$env:VA_CREDIT_SAFE_MODE = "1"
Set-Location -LiteralPath $repoRoot

# Best-effort local Hermes bootstrap. The daemon remains available through own-orch
# when Ollama is not installed or a model is not yet present.
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop | Out-Null
} catch {
    $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
    $ollamaPath = if ($ollamaCommand) { $ollamaCommand.Source } else { Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe" }
    if (Test-Path -LiteralPath $ollamaPath) {
        Start-Process -FilePath $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    }
}

# If Ollama is reachable but Hermes is missing, begin an idempotent background pull.
# own-orch and external providers continue while the model downloads.
try {
    $ollamaState = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
    $hasHermes = @($ollamaState.models | ForEach-Object { $_.name }) -contains "hermes3:latest"
    if (-not $hasHermes) {
        $ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
        $ollamaPath = if ($ollamaCommand) { $ollamaCommand.Source } else { Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe" }
        if (Test-Path -LiteralPath $ollamaPath) {
            $pullAlreadyRunning = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
                $_.Name -eq "ollama.exe" -and $_.CommandLine -match "pull\s+hermes3:latest"
            }
            if (-not $pullAlreadyRunning) {
                Start-Process -FilePath $ollamaPath -ArgumentList @("pull", "hermes3:latest") -WindowStyle Hidden
            }
        }
    }
} catch {
    # Provider health receipts will expose the degraded local state.
}

& $PythonPath "scripts\va-daemon-runner.py" --interval $IntervalSeconds --rank --validate --max-concurrency $MaxConcurrency --max-cost $MaxCostClass
exit $LASTEXITCODE
