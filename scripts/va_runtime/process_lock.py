"""Small cross-platform inter-process locks for Venture Atlas workers."""

from contextlib import contextmanager
import json
import os
import time


def _pid_is_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if os.name == "nt":
        import ctypes
        process_query_limited_information = 0x1000
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        ctypes.set_last_error(0)
        handle = kernel32.OpenProcess(process_query_limited_information, False, pid)
        if handle:
            kernel32.CloseHandle(handle)
            return True
        return ctypes.get_last_error() == 5
    try:
        os.kill(pid, 0)
        return True
    except PermissionError:
        return True
    except OSError:
        return False


def _remove_stale_lock(path: str, stale_after_seconds: int) -> None:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        pid = int(payload.get("pid", 0))
        created = float(payload.get("created", 0))
        if not _pid_is_alive(pid) or (created and time.time() - created > stale_after_seconds):
            os.unlink(path)
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        try:
            if time.time() - os.path.getmtime(path) > stale_after_seconds:
                os.unlink(path)
        except OSError:
            pass


@contextmanager
def process_file_lock(path: str, timeout_seconds: float = 15, stale_after_seconds: int = 7200):
    """Acquire an atomic lockfile and remove it only if this process owns it."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    deadline = time.monotonic() + timeout_seconds
    token = f"{os.getpid()}-{time.time_ns()}"
    payload = json.dumps({"pid": os.getpid(), "created": time.time(), "token": token})
    while True:
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(payload)
            break
        except FileExistsError:
            _remove_stale_lock(path, stale_after_seconds)
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for process lock: {path}")
            time.sleep(0.05)
    try:
        yield
    finally:
        try:
            with open(path, "r", encoding="utf-8") as handle:
                current = json.load(handle)
            if current.get("token") == token:
                os.unlink(path)
        except OSError:
            pass
