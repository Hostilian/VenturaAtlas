#!/usr/bin/env python3
"""Run cheap provider reachability probes and write a secret-free registry receipt."""
import argparse
import datetime
import os
import sys

from va_runtime.atomic_io import atomic_write_json, read_json_safe
from va_runtime.provider_router import get_provider_scheduler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY = os.path.join(ROOT, '.agent-system', 'provider-registry.json')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--timeout', type=float, default=4.0)
    args = parser.parse_args()
    scheduler = get_provider_scheduler()
    probes = scheduler.probe_configured_providers(args.timeout)
    registry = read_json_safe(REGISTRY, default_if_missing={})
    registry['lastHealthCheck'] = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    registry['verificationContract'] = 'cheap-reachability-probe-v1'
    for provider_id, result in probes.items():
        entry = registry.setdefault('providers', {}).setdefault(provider_id, {})
        entry.update({key: value for key, value in result.items() if key not in {'provider'}})
    atomic_write_json(REGISTRY, registry)
    safe = {provider: {key: value for key, value in result.items() if key not in {'error'}} for provider, result in probes.items()}
    print(safe)
    return 0

if __name__ == '__main__':
    sys.exit(main())
