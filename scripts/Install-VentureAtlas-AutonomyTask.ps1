[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$TaskName = "VentureAtlasAutonomy",
    [ValidateRange(30, 3600)][int]$IntervalSeconds = 120,
    [ValidateRange(1, 8)][int]$MaxConcurrency = 3,
    [ValidateRange(0, 3)][int]$MaxCostClass = 1,
    [ValidateRange(1, 8)][int]$ProviderFanout = 2,
    [ValidateRange(1, 60)][int]$WatchdogMinutes = 5,
    [switch]$StartNow
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$supervisor = Join-Path $PSScriptRoot "Start-VentureAtlas-Supervisor.ps1"
$pythonPath = (Get-Command python -ErrorAction Stop).Source
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$userSid = $identity.User.Value
$userName = $identity.Name
$startBoundary = [DateTime]::Now.AddMinutes(1).ToString("s")

if (-not (Test-Path -LiteralPath $supervisor)) {
    throw "Supervisor not found: $supervisor"
}

$xmlEscape = [System.Security.SecurityElement]::Escape
$escapedTask = $xmlEscape.Invoke("\$TaskName")
$escapedSid = $xmlEscape.Invoke($userSid)
$escapedUser = $xmlEscape.Invoke($userName)
$escapedRepo = $xmlEscape.Invoke($repoRoot)
$arguments = '-NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}" -IntervalSeconds {1} -MaxConcurrency {2} -MaxCostClass {3} -ProviderFanout {4} -PythonPath "{5}"' -f $supervisor, $IntervalSeconds, $MaxConcurrency, $MaxCostClass, $ProviderFanout, $pythonPath
$escapedArguments = $xmlEscape.Invoke($arguments)

$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.3" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><URI>$escapedTask</URI></RegistrationInfo>
  <Principals>
    <Principal id="Author">
      <UserId>$escapedSid</UserId>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <RestartOnFailure><Count>999</Count><Interval>PT1M</Interval></RestartOnFailure>
    <StartWhenAvailable>true</StartWhenAvailable>
    <WakeToRun>true</WakeToRun>
    <AllowHardTerminate>true</AllowHardTerminate>
    <UseUnifiedSchedulingEngine>true</UseUnifiedSchedulingEngine>
  </Settings>
  <Triggers>
    <LogonTrigger><Enabled>true</Enabled><UserId>$escapedUser</UserId></LogonTrigger>
    <SessionStateChangeTrigger><Enabled>true</Enabled><StateChange>SessionUnlock</StateChange><UserId>$escapedUser</UserId></SessionStateChangeTrigger>
    <EventTrigger>
      <Enabled>true</Enabled>
      <Subscription>&lt;QueryList&gt;&lt;Query Id="0" Path="System"&gt;&lt;Select Path="System"&gt;*[System[Provider[@Name='Microsoft-Windows-Power-Troubleshooter'] and EventID=1]]&lt;/Select&gt;&lt;/Query&gt;&lt;/QueryList&gt;</Subscription>
    </EventTrigger>
    <TimeTrigger>
      <Enabled>true</Enabled>
      <StartBoundary>$startBoundary</StartBoundary>
      <Repetition><Interval>PT${WatchdogMinutes}M</Interval><StopAtDurationEnd>false</StopAtDurationEnd></Repetition>
    </TimeTrigger>
  </Triggers>
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>$escapedArguments</Arguments>
      <WorkingDirectory>$escapedRepo</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"@

$backupDir = Join-Path $repoRoot ".agent-state\task-backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    $stamp = [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ")
    Export-ScheduledTask -TaskName $TaskName | Set-Content -LiteralPath (Join-Path $backupDir "$TaskName-$stamp.xml") -Encoding Unicode
}

if ($PSCmdlet.ShouldProcess($TaskName, "Register resilient Venture Atlas autonomy task")) {
    if ($existing -and $existing.State -eq "Running") {
        Stop-ScheduledTask -TaskName $TaskName
        Start-Sleep -Seconds 3
    }
    Register-ScheduledTask -TaskName $TaskName -Xml $xml -Force | Out-Null
    if ($StartNow) {
        Start-ScheduledTask -TaskName $TaskName
    }
}

$task = Get-ScheduledTask -TaskName $TaskName
[pscustomobject]@{
    TaskName = $task.TaskName
    State = $task.State
    TriggerCount = @($task.Triggers).Count
    MultipleInstances = $task.Settings.MultipleInstances
    RestartCount = $task.Settings.RestartCount
    StartWhenAvailable = $task.Settings.StartWhenAvailable
    WakeToRun = $task.Settings.WakeToRun
}
