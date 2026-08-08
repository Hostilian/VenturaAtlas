"""
VenturaAtlas OS — D:\\CODING\\ Multi-Project Path Adaptation Script
====================================================================
Replaces hardcoded D:\\CODING\\eushop paths in .agents/skills/ with dynamic, workspace-relative paths.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(ROOT, ".agents", "skills")

def adapt_paths():
    print("=== Adapting Workspace Skill Paths for D:\\CODING\\ Multi-Project Execution ===")
    
    modified_count = 0
    for root_dir, _, files in os.walk(SKILLS_DIR):
        for fname in files:
            if fname == "SKILL.md":
                fpath = os.path.join(root_dir, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()

                new_content = content
                # Replace D:\CODING\eushop references with dynamic paths
                new_content = new_content.replace(r"D:\CODING\eushop-agents", r".agent-worktrees")
                new_content = new_content.replace(r"D:\CODING\eushop", r".")
                new_content = new_content.replace(r"Hostilian/eushop", r"current repository")
                new_content = new_content.replace(r"basePath: '/eushop'", r"basePath: ''")
                new_content = new_content.replace(r"assetPrefix: '/eushop/'", r"assetPrefix: ''")

                if new_content != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    modified_count += 1
                    rel_path = os.path.relpath(fpath, ROOT)
                    print(f"[OK] Adapted paths in: {rel_path}")

    print(f"Adapted paths across {modified_count} skill files in .agents/skills/")

if __name__ == "__main__":
    adapt_paths()
