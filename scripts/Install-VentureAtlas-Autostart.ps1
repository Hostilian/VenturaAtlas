param(
    [int]$IntervalSeconds = 120,
    [int]$MaxConcurrency = 3,
    [ValidateRange(0, 3)][int]$MaxCostClass = 1,
    [ValidateRange(1, 8)][int]$ProviderFanout = 2
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$python = (Get-Command python -ErrorAction Stop).Source
$startup = [Environment]::GetFolderPath("Startup")
$launcher = Join-Path $startup "VentureAtlas-Always-On.cmd"
$taskName = "VentureAtlasAutonomy"
$supervisor = Join-Path $PSScriptRoot "Start-VentureAtlas-Supervisor.ps1"
$taskArgs = "-NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$supervisor`" -IntervalSeconds $IntervalSeconds -MaxConcurrency $MaxConcurrency -MaxCostClass $MaxCostClass -ProviderFanout $ProviderFanout -PythonPath `"$python`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $taskArgs -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -WakeToRun
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

$lines = @(
    "@echo off",
    "schtasks.exe /Run /TN `"$taskName`" >nul 2>&1"
)
[System.IO.File]::WriteAllLines($launcher, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Host "Installed supervised Venture Atlas scheduled task: $taskName"
Write-Host "Installed login launcher: $launcher"
Write-Host "It starts at Windows sign-in. The Cloud Run job is required while this computer is off."
