---
name: eushop-security-codeql-taint-remediation
description: "CodeQL Zero-Critical Program & Taint Sink Remediation Skill for EUshop"
---

# EUshop CodeQL Taint Remediation Skill

## Overview

This skill provides mandatory remediation patterns for CodeQL alerts, input validation, and secure file handling.

---

## 1. Path Expression Security (`FileStorageService`)

NEVER trust user-supplied filenames directly in path construction:
```java
Path destinationFile = this.rootLocation.resolve(filename).normalize().toAbsolutePath();
if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
    throw new SecurityException("Path traversal attempt detected.");
}
```

---

## 2. Numeric Cast Validation (`Dac7Service`)

Validate numeric inputs using `BigDecimal` scale/precision checks before casting:
```java
BigDecimal val = new BigDecimal(rawString).setScale(2, RoundingMode.HALF_UP);
if (val.compareTo(BigDecimal.ZERO) < 0 || val.compareTo(MAX_THRESHOLD) > 0) {
    throw new IllegalArgumentException("Numeric bounds violation.");
}
```
