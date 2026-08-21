import csv, os, sys

FIELDS = ["skill", "skill_version", "embodiment", "environment", "trials", "completion_rate", "cycle_time_p50", "cycle_time_p95", "intervention_rate", "recovery_rate", "failure_categories", "result", "observed_at"]
PATH = os.path.join(os.path.dirname(__file__), "compatibility-matrix.csv")

if not os.path.exists(PATH):
    with open(PATH, "w", newline="", encoding="utf-8") as f: csv.DictWriter(f, fieldnames=FIELDS).writeheader()
if len(sys.argv) > 1:
    values = dict(zip(FIELDS, sys.argv[1:]))
    with open(PATH, "a", newline="", encoding="utf-8") as f: csv.DictWriter(f, fieldnames=FIELDS).writerow(values)
print(PATH)
