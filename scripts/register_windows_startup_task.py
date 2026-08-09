import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
daemon_script = os.path.join(ROOT, "scripts", "va-daemon-runner.py")
python_exe = sys.executable

appdata = os.environ.get("APPDATA", "")
if appdata:
    startup_dir = os.path.join(appdata, "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
    if os.path.exists(startup_dir):
        bat_path = os.path.join(startup_dir, "VentureAtlasDaemon.bat")
        bat_content = f'@echo off\ncd /d "{ROOT}"\nstart "VentureAtlasDaemon" /min "{python_exe}" "{daemon_script}" --interval 120 --rank\n'
        with open(bat_path, "w", encoding="utf-8") as bf:
            bf.write(bat_content)
        print(f"[SUCCESS] Created Startup folder auto-launcher: {bat_path}")
        print("Venture Atlas Autonomous Daemon will now start automatically whenever your laptop turns on or logs in!")
