import os
import json
import hashlib
import tempfile
from typing import Tuple, Dict, Any, Optional

def compute_object_digest(obj: Any) -> str:
    normalized = json.dumps(obj, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

def read_durable_state(path: str) -> Tuple[bool, int, Optional[str], Optional[Dict[str, Any]]]:
    if not os.path.exists(path):
        return False, 0, None, None
    with open(path, 'r', encoding='utf-8') as f:
        state = json.load(f)
    revision = int(state.get('stateRevision', state.get('iteration', 0)))
    digest = compute_object_digest(state)
    return True, revision, digest, state

def write_durable_state_cas(path: str, expected_revision: int, next_payload: Dict[str, Any], run_id: str = 'local-run') -> Dict[str, Any]:
    exists, current_revision, current_digest, _ = read_durable_state(path)
    if exists and current_revision != expected_revision:
        raise ValueError(f"STATE_CONFLICT: Expected revision {expected_revision}, found {current_revision}")
    
    next_revision = expected_revision + 1
    next_state = dict(next_payload)
    next_state['stateRevision'] = next_revision
    next_state['previousRevision'] = expected_revision
    next_state['previousDigest'] = current_digest
    next_state['runId'] = run_id
    
    next_digest = compute_object_digest(next_state)
    next_state['currentDigest'] = next_digest

    dir_name = os.path.dirname(path) or '.'
    os.makedirs(dir_name, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', dir=dir_name, delete=False, encoding='utf-8') as tf:
        json.dump(next_state, tf, indent=2)
        tf.write('\n')
        temp_name = tf.name
    
    os.replace(temp_name, path)
    return {
        "success": True,
        "revision": next_revision,
        "digest": next_digest,
        "state": next_state
    }
