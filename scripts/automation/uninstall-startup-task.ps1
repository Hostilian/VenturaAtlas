# Venture Atlas OS — Windows Scheduled Task Uninstallation Script
# ======================================================================

Param(
    [string]$TaskName = "VenturaAtlasAutonomousDaemon"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Unregistering Windows Scheduled Task: $TaskName ==="

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[SUCCESS] Task '$TaskName' removed cleanly."
} else {
    Write-Host "[INFO] Task '$TaskName' was not found."
}
