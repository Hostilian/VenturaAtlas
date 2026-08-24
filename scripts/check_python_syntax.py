"""Parse every tracked Python source file without importing or executing it."""

from __future__ import annotations

import ast
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def tracked_python_files() -> list[Path]:
    result = subprocess.run(
        ['git', 'ls-files', '-z', '*.py'],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return [ROOT / raw.decode('utf-8') for raw in result.stdout.split(b'\0') if raw]


def main() -> int:
    failures: list[tuple[Path, SyntaxError]] = []
    files = tracked_python_files()
    for file_path in files:
        try:
            source = file_path.read_text(encoding='utf-8-sig')
            ast.parse(source, filename=str(file_path))
        except SyntaxError as error:
            failures.append((file_path, error))

    if failures:
        print(f'[ERROR] {len(failures)} tracked Python file(s) failed syntax validation.')
        for file_path, error in failures:
            print(f'  - {file_path.relative_to(ROOT)}:{error.lineno}: {error.msg}')
        return 1

    print(f'[OK] Parsed {len(files)} tracked Python files.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
