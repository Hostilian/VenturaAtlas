@echo off
cd /d "c:\Users\Hostilian\Downloads\venture-atlas-os-v2\venture-atlas-os-v2"
start /min powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File "c:\Users\Hostilian\Downloads\venture-atlas-os-v2\venture-atlas-os-v2\scripts\Start-VentureAtlas-AutonomousDaemon.ps1" -IntervalSeconds 120 -MaxIterations 999999 -Rank -Validate
