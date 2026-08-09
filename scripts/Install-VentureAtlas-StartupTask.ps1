# Venture Atlas OS -- Windows Startup Task Installer
#
# Registers a Windows Scheduled Task named "VentureAtlasAutonomousDaemon"
# that starts automatically upon user logon and loops continuous research.

[CmdletBinding()]
param(
    [string]$TaskName = "VentureAtlasAutonomousDaemon",
    [int]$IntervalSeconds = 120,
    [switch]$Uninstall
)

$RepoPath = "c:\Users\Hostilian\Downloads\venture-atlas-os-v2\venture-atlas-os-v2"
$ScriptPath = Join-Path $RepoPath "scripts\Start-VentureAtlas-AutonomousDaemon.ps1"

$StartupFolder = [Environment]::GetFolderPath("Startup")
$StartupCmd = Join-Path $StartupFolder "VentureAtlasDaemon.cmd"
$SourceCmd  = Join-Path $RepoPath "scripts\VentureAtlas-Startup-Launcher.cmd"

if ($Uninstall) {
    if (Test-Path $StartupCmd) { Remove-Item $StartupCmd -Force }
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "[SUCCESS] Auto-start entry removed." -ForegroundColor Yellow
    exit 0
}

# Install Startup folder script (no Admin rights needed)
Copy-Item -LiteralPath $SourceCmd -Destination $StartupCmd -Force

Write-Host ""
Write-Host "[SUCCESS] Venture Atlas Auto-Start Enabled!" -ForegroundColor Green
Write-Host "  Trigger           : Automatically when laptop opens & Windows logs in" -ForegroundColor Cyan
Write-Host "  Startup Shortcut  : $StartupCmd" -ForegroundColor Cyan
Write-Host "  Repo Location     : $RepoPath" -ForegroundColor Cyan
Write-Host "  Execution Mode    : Unattended Infinite Loop (999,999 runs)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test starting the background daemon right now:" -ForegroundColor Yellow
Write-Host "  & '$StartupCmd'" -ForegroundColor Yellow
Write-Host ""
