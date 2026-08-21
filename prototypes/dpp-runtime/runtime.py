import hashlib, json, sys

REQUIRED = {"product_id": "product identifier", "operator_id": "operator identity", "product_group": "product group", "passport_url": "passport URL"}

def register(product):
    errors = [{"field": k, "message": v} for k, v in REQUIRED.items() if not product.get(k)]
    proof = hashlib.sha256(json.dumps(product, sort_keys=True).encode()).hexdigest() if not errors else None
    return {"status": "READY_FOR_REGISTRY" if not errors else "ERROR", "errors": errors, "proof_hash": proof, "registry_mode": "sandbox"}

if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as handle:
        print(json.dumps(register(json.load(handle)), indent=2))
