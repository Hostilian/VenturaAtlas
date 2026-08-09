# Venture Atlas OS — Windows Scheduled Task Registration Script
# ====================================================================
# Configures a non-privileged Windows Scheduled Task triggering
# startup.ps1 on user logon to resume orchestrator daemons cleanly.

Param(
    [string]$TaskName = "VenturaAtlasAutonomousDaemon"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$StartupScript = Resolve-Path (Join-Path $ScriptDir "startup.ps1")
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..\..")

Write-Host "=== Registering Windows Scheduled Task: $TaskName ==="
Write-Host "Target script: $StartupScript"
Write-Host "Working dir  : $RepoRoot"

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StartupScript`" -Background" -WorkingDirectory $RepoRoot
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)

try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Auto-resumes Venture Atlas OS orchestrator daemon on user logon." -Force | Out-Null
    Write-Host "[SUCCESS] Scheduled Task '$TaskName' registered successfully!"
    Write-Host "To remove this task at any time, run: .\scripts\automation\uninstall-startup-task.ps1"
} catch {
    Write-Error "Failed to register scheduled task: $_"
}
