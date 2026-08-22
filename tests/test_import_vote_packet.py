import importlib.util
import json
from pathlib import Path


PATH = Path(__file__).parents[1] / "scripts" / "import_vote_packet.py"
SPEC = importlib.util.spec_from_file_location("import_vote_packet", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def write_packet(path: Path, person_id: str, votes=None, scorecards=None, evaluations=None, nickname=None):
    packet = {
        "packetVersion": "1.0",
        "personId": person_id,
        "constitutionVersion": "0.1-partial",
        "evaluations": evaluations or {},
        "pairwiseVotes": [],
    }
    if nickname:
        packet["nickname"] = nickname
    if votes is not None:
        packet["votes"] = votes
    if scorecards is not None:
        packet["scorecards"] = scorecards
    path.write_text(json.dumps(packet), encoding="utf-8")


def test_aggregate_vote_packets_combines_votes_notes_and_stats():
    packets = [
        {
            "personId": "P1",
            "nickname": "Ada",
            "votes": {"idea-1": "interested", "idea-2": "pass"},
            "scorecards": {"idea-1": {"score": 8, "confidence": 2}, "idea-2": {"score": 4, "confidence": 1}},
            "evaluations": {"idea-1": {"contribution": "Strong pull"}, "idea-2": {"dealbreaker": "Too crowded"}},
        },
        {
            "personId": "P2",
            "nickname": "Bea",
            "votes": {"idea-1": "unsure", "idea-2": "interested"},
            "scorecards": {"idea-1": {"score": 4, "confidence": 1}, "idea-2": {"score": 7, "confidence": 3}},
            "evaluations": {"idea-1": {"reasonNotToBuild": "Not enough proof"}},
        },
    ]

    summary = MODULE.aggregate_vote_packets(packets)

    assert summary["packetCount"] == 2
    assert summary["ideas"][0]["ideaId"] == "idea-1"
    idea1 = next(item for item in summary["ideas"] if item["ideaId"] == "idea-1")
    idea2 = next(item for item in summary["ideas"] if item["ideaId"] == "idea-2")

    assert idea1["tally"]["votes"] == {"interested": 1, "unsure": 1, "pass": 0, "other": 0}
    assert idea1["tally"]["scorecards"] == 2
    assert idea1["scores"]["mean"] == 6.0
    assert idea1["scores"]["median"] == 6.0
    assert idea1["scores"]["stdev"] == 2.0
    assert idea1["scores"]["confidenceWeightedMean"] == 6.67
    assert idea1["highDisagreement"] is True
    assert [n["personId"] for n in idea1["notesByPerson"]] == ["P1", "P2"]

    assert idea2["tally"]["votes"]["interested"] == 1
    assert idea2["tally"]["votes"]["pass"] == 1
    assert idea2["scores"]["mean"] == 5.5
    assert summary["highDisagreementIdeaIds"] == ["idea-1", "idea-2"]


def test_aggregate_vote_packet_files_reports_bad_file_and_keeps_good_packets(tmp_path: Path):
    good = tmp_path / "vote-packet-good.json"
    bad = tmp_path / "vote-packet-bad.json"
    write_packet(good, "P1", votes={"idea-3": "interested"}, scorecards={"idea-3": {"score": 5, "confidence": 1}}, nickname="Nora")
    bad.write_text("{}", encoding="utf-8")

    summary = MODULE.aggregate_vote_packet_files([good, bad])

    assert summary["packetCount"] == 1
    assert summary["people"][0]["label"] == "Nora"
    assert summary["errors"] and "Missing personId" in summary["errors"][0]["error"]
    assert summary["ideas"][0]["ideaId"] == "idea-3"


def test_load_vote_packet_requires_identity_and_constitution(tmp_path: Path):
    packet = tmp_path / "vote-packet.json"
    packet.write_text(json.dumps({"personId": "P1"}), encoding="utf-8")

    try:
        MODULE.load_vote_packet(packet)
        assert False, "expected ValueError"
    except ValueError as exc:
        assert "constitutionVersion" in str(exc)
