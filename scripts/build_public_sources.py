"""Build the explicit public evidence-source projection.

The projection fails closed when source visibility or epistemic classification
is missing. Privacy is never inferred from an ID prefix.
"""

from __future__ import annotations

import json
import os
import pathlib
import tempfile
import argparse


ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES_FILE = ROOT / "data" / "sources.json"
PUBLIC_SOURCES_FILE = ROOT / "data" / "public-sources.json"

PUBLIC_SOURCE_CLASSES = {
    "PRIMARY_OR_OFFICIAL",
    "RESEARCH_PUBLICATION",
    "COMPANY_OR_INDUSTRY",
    "COMMUNITY",
}
REQUIRED_METADATA = {
    "visibility": str,
    "sourceClass": str,
    "evidenceEligible": bool,
    "provenanceEligible": bool,
}


def atomic_json_write(path: pathlib.Path, value: object) -> None:
    serialized = json.dumps(value, indent=2, ensure_ascii=False) + "\n"
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, delete=False, newline="\n"
    ) as handle:
        handle.write(serialized)
        temporary = pathlib.Path(handle.name)
    os.replace(temporary, path)


def main(output_path: pathlib.Path = PUBLIC_SOURCES_FILE) -> int:
    raw = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    sources = raw if isinstance(raw, list) else raw.get("sources", [])
    if not isinstance(sources, list):
        raise ValueError("data/sources.json must contain a source list")

    errors: list[str] = []
    public_sources: list[dict[str, object]] = []
    for index, source in enumerate(sources):
        if not isinstance(source, dict):
            errors.append(f"source[{index}] is not an object")
            continue
        source_id = str(source.get("id", f"index-{index}"))
        for field, expected_type in REQUIRED_METADATA.items():
            if type(source.get(field)) is not expected_type:
                errors.append(f"{source_id}: missing or invalid {field}")

        visibility = source.get("visibility")
        source_class = source.get("sourceClass")
        evidence_eligible = source.get("evidenceEligible")
        if visibility == "PUBLIC":
            if source_class not in PUBLIC_SOURCE_CLASSES:
                errors.append(f"{source_id}: public sourceClass is not publishable")
            if not isinstance(source.get("url"), str) or not source["url"].startswith(("https://", "http://")):
                errors.append(f"{source_id}: public source requires an HTTP(S) URL")
            if evidence_eligible is True and source_class in PUBLIC_SOURCE_CLASSES:
                public_sources.append(source)
        elif visibility not in {"INTERNAL", "PRIVATE"}:
            errors.append(f"{source_id}: unsupported visibility {visibility!r}")

    if errors:
        for error in errors:
            print(f"[ERROR] {error}")
        print("[ERROR] Public source projection aborted; existing output was not replaced.")
        return 1
    if not public_sources:
        print("[ERROR] Public source projection is empty; existing output was not replaced.")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    atomic_json_write(output_path, public_sources)
    print(
        f"[OK] Generated {output_path} "
        f"({len(public_sources)} explicitly PUBLIC evidence sources from {len(sources)} total)."
    )
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the public evidence-source projection")
    parser.add_argument(
        "--output",
        type=pathlib.Path,
        default=PUBLIC_SOURCES_FILE,
        help="Projection target (defaults to the tracked data/public-sources.json)",
    )
    arguments = parser.parse_args()
    raise SystemExit(main(arguments.output.resolve()))
