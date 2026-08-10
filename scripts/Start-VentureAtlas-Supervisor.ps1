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
Set-Location -LiteralPath $repoRoot
& $PythonPath "scripts\va-daemon-runner.py" --interval $IntervalSeconds --rank --validate --max-concurrency $MaxConcurrency --max-cost $MaxCostClass
exit $LASTEXITCODE
