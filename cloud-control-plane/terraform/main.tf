# Venture Atlas OS — GCP Cloud Control Plane Infrastructure
# Terraform configuration for 24/7 unattended cloud execution

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID for Venture Atlas OS"
}

variable "gcp_region" {
  type        = string
  description = "GCP Region for Cloud Run & Cloud Scheduler"
  default     = "europe-west1"
}

variable "worker_image" {
  type        = string
  description = "Immutable Artifact Registry image reference for the worker, including @sha256:<64 hex digest>"

  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.worker_image))
    error_message = "worker_image must be immutable and end with @sha256:<64 lowercase hex characters>."
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ── 0. Enable Required GCP APIs ───────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudtasks.googleapis.com",
    "firestore.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudscheduler.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# ── 1. Artifact Registry ──────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "repo" {
  location      = var.gcp_region
  repository_id = "venture-atlas-repo"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# ── 2. Firestore Database ─────────────────────────────────────────────────────
resource "google_firestore_database" "database" {
  name        = "(default)"
  location_id = var.gcp_region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.apis]
}

# ── 3. Cloud Tasks Queue ──────────────────────────────────────────────────────
resource "google_cloud_tasks_queue" "pipeline_queue" {
  name       = "venture-atlas-tasks"
  location   = var.gcp_region
  depends_on = [google_project_service.apis]

  rate_limits {
    max_dispatches_per_second = 10
    max_concurrent_dispatches = 5
  }

  retry_config {
    max_attempts = 5
    min_backoff  = "10s"
    max_backoff  = "300s"
  }
}

# ── 4. Secret Manager Secrets for Provider Pools ─────────────────────────────
locals {
  provider_secret_ids = {
    OPENROUTER_API_KEYS = "va-openrouter-01"
    ANTHROPIC_API_KEYS  = "va-anthropic-01"
    ACTIVE_API_KEYS     = "va-active-01"
    DEEPSEEK_API_KEYS   = "va-deepseek-01"
    GITHUB_TOKEN        = "va-github-token"
  }
}

resource "google_secret_manager_secret" "provider_secrets" {
  for_each   = local.provider_secret_ids
  secret_id  = each.value
  depends_on = [google_project_service.apis]
  replication {
    auto {}
  }
}

# ── 5. Dedicated Service Accounts ─────────────────────────────────────────────
resource "google_service_account" "worker_sa" {
  account_id   = "va-cloud-worker-sa"
  display_name = "Venture Atlas Worker Service Account"
}

resource "google_service_account" "publisher_sa" {
  account_id   = "va-cloud-publisher-sa"
  display_name = "Venture Atlas Publisher Service Account"
}

resource "google_service_account" "scheduler_sa" {
  account_id   = "va-cloud-scheduler-sa"
  display_name = "Venture Atlas Scheduler Invoker"
}

resource "google_secret_manager_secret_iam_member" "secret_access" {
  for_each  = google_secret_manager_secret.provider_secrets
  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.worker_sa.email}"
}

# ── 6. Cloud Run Job Definition ───────────────────────────────────────────────
resource "google_cloud_run_v2_job" "venture_atlas_worker" {
  name       = "venture-atlas-discovery-worker"
  location   = var.gcp_region
  depends_on = [google_artifact_registry_repository.repo]

  template {
    template {
      service_account = google_service_account.worker_sa.email
      containers {
        image = var.worker_image
        resources {
          limits = {
            cpu    = "2000m"
            memory = "2Gi"
          }
        }
        env {
          name  = "GCP_PROJECT_ID"
          value = var.gcp_project_id
        }
      }
    }
  }
}

resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker" {
  project  = var.gcp_project_id
  location = google_cloud_run_v2_job.venture_atlas_worker.location
  name     = google_cloud_run_v2_job.venture_atlas_worker.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.scheduler_sa.email}"
}

# ── 7. Cloud Scheduler Trigger ────────────────────────────────────────────────
resource "google_cloud_scheduler_job" "discovery_trigger" {
  name        = "venture-atlas-2hr-trigger"
  description = "Triggers Venture Atlas Autonomous Discovery Worker every 2 hours"
  schedule    = "0 */2 * * *"
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://run.googleapis.com/v2/projects/${var.gcp_project_id}/locations/${var.gcp_region}/jobs/${google_cloud_run_v2_job.venture_atlas_worker.name}:run"
    body        = base64encode("{}")
    headers = {
      "Content-Type" = "application/json"
    }
    oauth_token {
      service_account_email = google_service_account.scheduler_sa.email
    }
  }

  depends_on = [google_cloud_run_v2_job_iam_member.scheduler_invoker]
}
