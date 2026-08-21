import json, sys

REQUIRED = {"shipment_id": "stable shipment identifier", "origin": "origin location", "destination": "destination location", "carrier": "carrier identity"}

def validate(shipment):
    errors = [{"field": k, "message": v} for k, v in REQUIRED.items() if not shipment.get(k)]
    return {"status": "ERROR" if errors else "PASS", "errors": errors, "schema_version": "efti-fixture-0.1"}

if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as handle:
        print(json.dumps(validate(json.load(handle)), indent=2))
