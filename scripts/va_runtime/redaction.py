"""Shared secret redaction for worker responses, logs, and receipts."""

import re


_PATTERNS = (
    (re.compile(r"x-access-token:[^@\s]+@", re.I), "x-access-token:[REDACTED]@"),
    (re.compile(r"github_pat_[A-Za-z0-9_]{20,}"), "github_pat_[REDACTED]"),
    (re.compile(r"gh[pousa]_[A-Za-z0-9]{20,}"), "gh*_[REDACTED]"),
    (re.compile(r"(Authorization:\s*(?:Basic|Bearer)\s+)[^\s]+", re.I), r"\1[REDACTED]"),
    (re.compile(r"sk-[A-Za-z0-9_-]{20,}"), "sk-[REDACTED]"),
)


def redact_secrets(text: str) -> str:
    result = text or ""
    for pattern, replacement in _PATTERNS:
        result = pattern.sub(replacement, result)
    return result
