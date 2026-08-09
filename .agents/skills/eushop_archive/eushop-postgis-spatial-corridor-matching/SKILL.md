---
name: eushop-postgis-spatial-corridor-matching
description: "PostGIS Spatial Corridor Geometry & Distance Algorithm Skill for EUshop"
---

# EUshop PostGIS Spatial Corridor Skill

## Overview

This skill provides spatial corridor algorithms, bounding box filters, and `ST_Buffer` queries for cross-border trip matching in PostgreSQL.

---

## 1. Corridor Algorithm Standard

- Compute route corridor buffers using `ST_Buffer(ST_MakeLine(origin, destination)::geography, buffer_meters)`.
- Use GiST spatial indexes to evaluate point-in-corridor intersections in sub-10ms latency.
