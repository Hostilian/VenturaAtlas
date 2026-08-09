---
name: eushop-auth0-session-jwt-security
description: "Fail-Closed Auth0 JWT Authentication Filter & Session Security Skill for EUshop"
---

# EUshop Auth0 & Session Security Skill

## Overview

This skill establishes security standards for `JwtAuthenticationFilter.java`, session cookies, and role-based authorization.

---

## 1. Fail-Closed Authentication Filter

- In production (`spring.profiles.active=prod`), if JWT authentication secret or Auth0 domain is missing, `JwtAuthenticationFilter` MUST fail closed and reject incoming requests with HTTP 401 Unauthenticated.
- Dev mock authentication profiles (`spring.profiles.active=dev`) MUST be strictly gated and disabled in production builds.
