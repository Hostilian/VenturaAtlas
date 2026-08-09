---
name: eushop-security-codeql-zero-critical
description: "Zero-Critical CodeQL Security Enforcement & OWASP Mitigation Skill for EUshop"
---

# EUshop CodeQL Zero-Critical Security Skill

## Overview

This skill establishes zero-critical security rules, SQL injection prevention, parameterization, and OWASP Top 10 mitigations.

---

## 1. Zero SQL Injection Standard

- All database queries MUST use JPA/Hibernate parameterized named parameters (`:param`) or Criteria API.
- NEVER concatenate raw user strings into SQL or HQL query strings.
