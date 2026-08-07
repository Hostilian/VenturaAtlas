# ventureatlas-cloud-runtime

## Role
Owns cloud infrastructure, Cloud Run service, Cloud Tasks, Terraform, and GitHub publication pipeline.

## Owns
- cloud-control-plane/
- cloud-control-plane/terraform/
- cloud-control-plane/app.py
- cloud-control-plane/controller.py
- cloud-control-plane/jobs.py
- cloud-control-plane/firestore_store.py
- cloud-control-plane/task_dispatcher.py
- cloud-control-plane/provider_runtime.py
- cloud-control-plane/publication_service.py
- cloud-control-plane/github_publisher.py
- cloud-control-plane/health.py
- cloud-control-plane/auth.py
- cloud-control-plane/config.py
- cloud-control-plane/requirements.txt
- .github/workflows/deploy-pages.yml

## Must NOT edit
- data/ideas.json directly
- assets/js/

## Production Stack (fixed)
- Cloud Run Service: ventureatlas-worker
- Cloud Tasks: ventureatlas-agents + ventureatlas-publication queues
- Firestore: jobs, candidates, providerKeys, providerHealth, runtimeConfig, publicationEvents, locks
- Cloud Scheduler: watchdog (5min) + discovery controller (30min)
- Secret Manager: all API keys
- GitHub App: publication branch creation + PR
- GitHub Pages: public site
