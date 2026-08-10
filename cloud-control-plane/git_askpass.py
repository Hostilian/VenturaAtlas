#!/usr/bin/env python3
"""Minimal non-interactive Git askpass helper; the secret is read only from child environment."""

import os
import sys

prompt = sys.argv[1].lower() if len(sys.argv) > 1 else ""
if "username" in prompt:
    print("x-access-token")
elif "password" in prompt:
    print(os.environ.get("VA_GITHUB_TOKEN", ""))
else:
    print("")
