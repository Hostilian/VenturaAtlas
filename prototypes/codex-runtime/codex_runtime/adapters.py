from __future__ import annotations

from typing import Any

from .conformance import Check, ConformanceEngine


class EudrSyntheticAdapter:
    """Synthetic boundary used to test shared primitives; not an official EUDR client."""

    regime = "EUDR"
    validator_version = "synthetic-eudr-0.1"

    @staticmethod
    def _has_commodity(payload: dict[str, Any]) -> tuple[bool, str]:
        ok = bool(str(payload.get("commodity", "")).strip())
        return ok, "commodity present" if ok else "commodity missing"

    @staticmethod
    def _has_geometry(payload: dict[str, Any]) -> tuple[bool, str]:
        geometry = payload.get("geolocation")
        ok = isinstance(geometry, dict) and geometry.get("type") in {"Point", "Polygon", "MultiPolygon"}
        return ok, "synthetic geometry type accepted" if ok else "synthetic geometry type missing/unsupported"

    def preflight(self, payload: dict[str, Any]):
        engine = ConformanceEngine(
            [
                Check("EUDR-SYN-001", "repository synthetic rule", self._has_commodity),
                Check("EUDR-SYN-002", "repository synthetic rule", self._has_geometry),
            ]
        )
        return engine.run(payload)

