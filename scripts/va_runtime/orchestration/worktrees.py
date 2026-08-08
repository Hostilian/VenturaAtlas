"""
Venture Atlas OS — Worktree Isolation Manager
=================================================
Manages Git worktree creation for parallel specialist agents to prevent
concurrent edits in the primary working directory.
"""

import os
import sys
import subprocess
import shutil
import time
from typing import Optional, List

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
WORKTREE_BASE = os.path.join(ROOT, ".worktrees")

class WorktreeManager:
    def __init__(self, base_dir: str = WORKTREE_BASE):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def create_worktree(self, agent_role: str, task_id: str) -> Optional[str]:
        """
        Create a Git worktree for an isolated agent task.
        Returns the absolute path to the worktree directory.
        """
        branch_name = f"feat/va-{agent_role}-{task_id.lower()}"
        wt_path = os.path.join(self.base_dir, f"{agent_role}-{task_id.lower()}")

        # Clean up existing worktree at path if present
        if os.path.exists(wt_path):
            self.remove_worktree(wt_path, branch_name)

        try:
            cmd = ["git", "worktree", "add", "-b", branch_name, wt_path, "HEAD"]
            res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
            if res.returncode == 0:
                print(f"[OK] Created worktree '{wt_path}' on branch '{branch_name}'")
                return wt_path
            else:
                print(f"[WARN] Worktree creation returned non-zero code: {res.stderr}")
                return None
        except Exception as e:
            print(f"[ERROR] Failed to create worktree for {agent_role}: {e}")
            return None

    def remove_worktree(self, wt_path: str, branch_name: str = None) -> bool:
        """Prune and remove worktree."""
        try:
            subprocess.run(["git", "worktree", "remove", "--force", wt_path], capture_output=True, text=True, cwd=ROOT)
            if branch_name:
                subprocess.run(["git", "branch", "-D", branch_name], capture_output=True, text=True, cwd=ROOT)
            if os.path.exists(wt_path):
                shutil.rmtree(wt_path, ignore_errors=True)
            return True
        except Exception as e:
            print(f"[WARN] Error cleaning worktree '{wt_path}': {e}")
            return False

    def prune_all(self):
        """Prune stale worktree references."""
        subprocess.run(["git", "worktree", "prune"], capture_output=True, text=True, cwd=ROOT)

_MANAGER = WorktreeManager()

def get_worktree_manager() -> WorktreeManager:
    return _MANAGER

if __name__ == "__main__":
    wm = get_worktree_manager()
    print(f"Worktree manager initialized at: {wm.base_dir}")
