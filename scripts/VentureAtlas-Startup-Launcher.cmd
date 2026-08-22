@echo off
setlocal
set "REPO_ROOT=%~dp0.."
pushd "%REPO_ROOT%"
start /min powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File "%REPO_ROOT%\scripts\Start-VentureAtlas-AutonomousDaemon.ps1" -IntervalSeconds 120 -MaxIterations 999999 -Rank -Validate
popd
