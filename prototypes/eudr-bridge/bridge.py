import json, sys

REQUIRED = {"operator_id": "operator identity", "commodity": "commodity", "quantity": "quantity", "geolocation": "geolocation"}

def validate(payload):
    errors = [{"field": k, "message": v} for k, v in REQUIRED.items() if not payload.get(k)]
    if payload.get("quantity") is not None and (not isinstance(payload["quantity"], (int, float)) or payload["quantity"] <= 0):
        errors.append({"field": "quantity", "message": "must be positive number"})
    return {"status": "ERROR" if errors else "READY_FOR_ACCEPTANCE", "errors": errors, "idempotency_key": payload.get("operator_id")}

if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as handle:
        print(json.dumps(validate(json.load(handle)), indent=2))
