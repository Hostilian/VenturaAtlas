import os

GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "ventureatlas-prod")
GCP_REGION = os.environ.get("GCP_REGION", "europe-west1")
FIRESTORE_DATABASE = os.environ.get("FIRESTORE_DATABASE", "(default)")
WORKER_AUTH_TOKEN = os.environ.get("WORKER_AUTH_TOKEN", "")
DISCOVERY_QUEUE_NAME = os.environ.get("DISCOVERY_QUEUE_NAME", "ventureatlas-agents")
PUBLICATION_QUEUE_NAME = os.environ.get("PUBLICATION_QUEUE_NAME", "ventureatlas-publication")
AUTO_PROMOTE_THRESHOLD = float(os.environ.get("AUTO_PROMOTE_THRESHOLD", "85"))
IDEAS_PER_ITERATION = int(os.environ.get("IDEAS_PER_ITERATION", "3"))
