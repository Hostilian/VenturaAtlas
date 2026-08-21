import json, sys

def report(e):
    authority = e.get("financial_authority", {})
    actions = max(1, int(e.get("actions_taken", 0)))
    return {
        "episode_id": e.get("episode_id"),
        "maximum_value_at_risk": e.get("maximum_value_at_risk", 0),
        "authority_surface": {"autonomous_limit": authority.get("autonomous_limit"), "tools": e.get("tools_available", []), "data_access": e.get("data_access", [])},
        "exposure_features": {"irreversible_action_rate": e.get("irreversible_actions", 0) / actions, "policy_violation_rate": e.get("policy_violations", 0) / actions, "intervention_rate": e.get("human_interventions", 0) / actions, "near_miss": bool(e.get("near_miss", False))},
        "dependency_concentration": e.get("model_provider"),
        "disclaimer": "Telemetry summary only; not an insurance price, rating, or coverage decision."
    }

if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        print(json.dumps(report(json.load(f)), indent=2))
