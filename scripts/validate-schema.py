import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
ideas_file = root / 'data/ideas.json'
schema_file = root / 'schemas/idea.schema.json'

raw = json.loads(ideas_file.read_text(encoding='utf-8'))
ideas = raw if isinstance(raw, list) else raw.get('ideas', [])
schema = json.loads(schema_file.read_text(encoding='utf-8')) if schema_file.exists() else None

errs = []
required_fields = schema.get('required', ['id', 'slug', 'name', 'category', 'oneSentenceConcept']) if schema else ['id', 'slug', 'name', 'category', 'oneSentenceConcept']

for idx, x in enumerate(ideas):
    iid = x.get('id', f'index-{idx}')
    if not re.fullmatch(r'idea-\d{3}', x.get('id', '')):
        errs.append(f"Idea {iid}: bad ID format '{x.get('id')}'")
    for req in required_fields:
        if not x.get(req):
            errs.append(f"Idea {iid}: missing required field '{req}'")

# Attempt jsonschema if available
try:
    import jsonschema
    if schema:
        validator = jsonschema.Draft7Validator(schema)
        for idx, x in enumerate(ideas):
            iid = x.get('id', f'index-{idx}')
            for error in validator.iter_errors(x):
                errs.append(f"Idea {iid} schema violation: {error.message} at {list(error.path)}")
except ImportError:
    pass

print(json.dumps({'ideas': len(ideas), 'errors': errs}, indent=2))
sys.exit(bool(errs))
