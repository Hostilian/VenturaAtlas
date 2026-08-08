---
name: eushop-postgis-geospatial-matching
description: "PostGIS Spatial Corridor & Origin-Destination Search Engine for EUshop"
---

# EUshop PostGIS Geospatial Matching Skill

## Overview

This skill guides the implementation of PostGIS spatial queries, corridor matching, and location privacy masking across EUshop services.

---

## 1. PostGIS Spatial Schema Guidelines

- **Coordinate System**: WGS 84 (`SRID 4326`) using `geography(Point, 4326)`.
- **Indexing**: GiST or SP-GiST spatial indexes on origin, destination, and route corridor geometries.
- **Corridor Query Pattern**:
  ```sql
  SELECT * FROM seller_routes
  WHERE ST_DWithin(
      route_path::geography,
      ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
      :distance_meters
  );
  ```

---

## 2. Location Privacy Masking

- Never expose exact consumer lat/lon coordinates in public listing payloads.
- Mask consumer locations to coarse postal-code / city-level centroids (`~5km` radius blur) before rendering on public Mapbox layers.
