import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
skills_dir = os.path.join(ROOT, ".agents", "skills")
archive_dir = os.path.join(skills_dir, "eushop_archive")

os.makedirs(archive_dir, exist_ok=True)

moved_count = 0
for item in os.listdir(skills_dir):
    item_path = os.path.join(skills_dir, item)
    if os.path.isdir(item_path) and item.startswith("eushop-") and item != "eushop_archive":
        dest_path = os.path.join(archive_dir, item)
        shutil.move(item_path, dest_path)
        moved_count += 1

print(f"[OK] Isolated {moved_count} legacy eushop skills into .agents/skills/eushop_archive/ to eliminate domain contamination.")
