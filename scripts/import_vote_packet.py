#!/usr/bin/env python3
"""Vote packet aggregation for Venture Atlas collaboration exports.

Output shape
============
The module returns a JSON-serializable dictionary with this structure:

{
  "packetCount": int,
  "people": [
    {"personId": str, "label": str, "notesCount": int, "packetIndex": int}
  ],
  "ideas": [
    {
      "ideaId": str,
      "tally": {
        "votes": {"interested": int, "unsure": int, "pass": int, "other": int},
        "scorecards": int,
        "evaluations": int
      },
      "notesByPerson": [{"personId": str, "note": str, "packetIndex": int}],
      "scores": {
        "values": [float],
        "mean": float | None,
        "median": float | None,
        "stdev": float | None,
        "range": float | None,
        "confidenceWeightedMean": float | None,
        "polarization": float | None
      },
      "highDisagreement": bool,
      "participants": [str]
    }
  ],
  "highDisagreementIdeaIds": [str],
  "errors": [
    {"file": str, "error": str}
  ]
}

The browser-side compare view can mirror this exact shape without needing a server.
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Sequence


ALLOWED_REACTIONS = ("interested", "unsure", "pass")


def load_vote_packet(path: str | Path) -> dict[str, Any]:
    """Load and lightly validate one exported vote packet."""
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    if not data.get("personId"):
        raise ValueError(f"Missing personId in {p}")
    if not data.get("constitutionVersion"):
        raise ValueError(f"Missing constitutionVersion in {p}")
    return data


def _packet_label(packet: Mapping[str, Any], fallback_index: int) -> str:
    return str(packet.get("evaluator") or packet.get("nickname") or packet.get("roomName") or f"Voter {fallback_index + 1}")


def _extract_idea_ids(packet: Mapping[str, Any]) -> set[str]:
    ids: set[str] = set()
    for key in ("shortlist", "votes", "scorecards", "evaluations"):
        value = packet.get(key) or []
        if isinstance(value, Mapping):
            ids.update(str(k) for k in value.keys())
        elif isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
            ids.update(str(v) for v in value)
    return ids


def _numeric_score_from_scorecard(scorecard: Mapping[str, Any]) -> float | None:
    if isinstance(scorecard.get("score"), (int, float)) and math.isfinite(float(scorecard["score"])):
        return float(scorecard["score"])
    values = [
        float(v)
        for key, v in scorecard.items()
        if key not in {"confidence", "weeklyCommitmentHours", "vetoRequested"}
        and isinstance(v, (int, float))
        and math.isfinite(float(v))
    ]
    if not values:
        return None
    return sum(values) / len(values)


def aggregate_vote_packets(packets: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """Aggregate multiple vote packets into a comparison-ready summary."""
    people: list[dict[str, Any]] = []
    idea_ids: set[str] = set()
    for idx, packet in enumerate(packets):
        people.append(
            {
                "personId": str(packet.get("personId")),
                "label": _packet_label(packet, idx),
                "notesCount": len(packet.get("evaluations") or []),
                "packetIndex": idx,
            }
        )
        idea_ids.update(_extract_idea_ids(packet))

    ideas: list[dict[str, Any]] = []
    high_disagreement_ids: list[str] = []

    for idea_id in sorted(idea_ids):
        vote_tally = {k: 0 for k in ALLOWED_REACTIONS}
        vote_tally["other"] = 0
        scores: list[float] = []
        score_weights: list[float] = []
        notes_by_person: list[dict[str, Any]] = []
        participants: list[str] = []
        eval_count = 0

        for idx, packet in enumerate(packets):
            label = _packet_label(packet, idx)

            votes = packet.get("votes") or {}
            if isinstance(votes, Mapping) and idea_id in votes:
                raw = str(votes[idea_id])
                vote_tally[raw if raw in ALLOWED_REACTIONS else "other"] += 1
                participants.append(str(packet.get("personId")))

            scorecards = packet.get("scorecards") or {}
            if isinstance(scorecards, Mapping) and idea_id in scorecards:
                scorecard = scorecards[idea_id]
                if isinstance(scorecard, Mapping):
                    avg = _numeric_score_from_scorecard(scorecard)
                    if avg is not None:
                        scores.append(avg)
                        confidence = scorecard.get("confidence")
                        weight = float(confidence) if isinstance(confidence, (int, float)) and confidence > 0 else 1.0
                        score_weights.append(weight)
                        participants.append(str(packet.get("personId")))

            evaluations = packet.get("evaluations") or {}
            if isinstance(evaluations, Mapping) and idea_id in evaluations:
                eval_count += 1
                note = evaluations[idea_id]
                if isinstance(note, Mapping):
                    notes_by_person.append(
                        {
                            "personId": str(packet.get("personId")),
                            "note": str(
                                note.get("contribution")
                                or note.get("reasonToBuild")
                                or note.get("reasonNotToBuild")
                                or note.get("dealbreaker")
                                or ""
                            ).strip(),
                            "packetIndex": idx,
                            "label": label,
                        }
                    )

        mean = median = stdev = spread = cw_mean = polarization = None
        if scores:
            mean = statistics.mean(scores)
            median = statistics.median(scores)
            spread = max(scores) - min(scores)
            polarization = statistics.pstdev(scores) if len(scores) > 1 else 0.0
            if len(scores) > 1:
                stdev = statistics.pstdev(scores)
            if score_weights and len(score_weights) == len(scores):
                total_weight = sum(score_weights)
                cw_mean = sum(v * w for v, w in zip(scores, score_weights)) / total_weight if total_weight else None
            else:
                cw_mean = mean

        high_disagreement = bool(
            scores and (
                (stdev is not None and stdev >= 1.5)
                or (spread is not None and spread >= 3.0)
                or (vote_tally["pass"] > 0 and (vote_tally["interested"] > 0 or vote_tally["unsure"] > 0))
            )
        )
        if high_disagreement:
            high_disagreement_ids.append(idea_id)

        ideas.append(
            {
                "ideaId": idea_id,
                "tally": {
                    "votes": vote_tally,
                    "scorecards": len(scores),
                    "evaluations": eval_count,
                },
                "notesByPerson": notes_by_person,
                "scores": {
                    "values": scores,
                    "mean": round(mean, 2) if mean is not None else None,
                    "median": round(median, 2) if median is not None else None,
                    "stdev": round(stdev, 2) if stdev is not None else None,
                    "range": round(spread, 2) if spread is not None else None,
                    "confidenceWeightedMean": round(cw_mean, 2) if cw_mean is not None else None,
                    "polarization": round(polarization, 2) if polarization is not None else None,
                },
                "highDisagreement": high_disagreement,
                "participants": sorted(set(participants)),
            }
        )

    ideas.sort(
        key=lambda item: (
            item["scores"]["mean"] is None,
            -(item["scores"]["mean"] or 0),
            -(item["tally"]["votes"]["interested"]),
            item["ideaId"],
        )
    )
    high_disagreement_ids = sorted(set(high_disagreement_ids))

    return {
        "packetCount": len(packets),
        "people": people,
        "ideas": ideas,
        "highDisagreementIdeaIds": high_disagreement_ids,
        "errors": [],
    }


def aggregate_vote_packet_files(paths: Sequence[str | Path]) -> dict[str, Any]:
    packets: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for path in paths:
        try:
            packets.append(load_vote_packet(path))
        except Exception as exc:  # noqa: BLE001 - CLI should surface all file errors
            errors.append({"file": str(path), "error": str(exc)})
    summary = aggregate_vote_packets(packets)
    summary["errors"] = errors
    return summary


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Aggregate exported vote packets.")
    parser.add_argument("files", nargs="+", help="vote-packet-*.json files to aggregate")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    args = parser.parse_args(argv)

    summary = aggregate_vote_packet_files(args.files)
    indent = 2 if args.pretty else None
    print(json.dumps(summary, indent=indent, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
