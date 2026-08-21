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

variable "repository_url" {
  type        = string
  description = "Git repository URL cloned by the job; credentials are provided separately through askpass"
}

variable "baseline_commit" {
  type        = string
  description = "Optional exact commit SHA. Leave empty to resolve baseline_ref once at the start of each run."
  default     = ""

  validation {
    condition     = var.baseline_commit == "" || can(regex("^[0-9a-f]{40}$", var.baseline_commit))
    error_message = "baseline_commit must be empty or an exact lowercase 40-character Git commit SHA."
  }
}

variable "baseline_ref" {
  type        = string
  description = "Remote branch resolved to an immutable SHA at job start when baseline_commit is empty"
  default     = "main"

  validation {
    condition     = can(regex("^[A-Za-z0-9._/-]{1,120}$", var.baseline_ref)) && !strcontains(var.baseline_ref, "..")
    error_message = "baseline_ref must be a safe remote branch name."
  }
}

variable "private_staging_bucket_name" {
  type        = string
  description = "Globally unique private GCS bucket used for unreviewed discovery state"
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
    "cloudscheduler.googleapis.com",
    "storage.googleapis.com"
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
    NVIDIA_NIM_API_KEYS = "va-nvidia-nim-01"
    COHERE_API_KEYS     = "va-cohere-01"
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

resource "google_service_account" "scheduler_sa" {
  account_id   = "va-cloud-scheduler-sa"
  display_name = "Venture Atlas Scheduler Invoker"
}

resource "google_storage_bucket" "private_staging" {
  name                        = var.private_staging_bucket_name
  location                    = var.gcp_region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 30
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_storage_bucket_iam_member" "private_staging_writer" {
  bucket = google_storage_bucket.private_staging.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.worker_sa.email}"
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
    task_count  = 1
    parallelism = 1
    template {
      service_account = google_service_account.worker_sa.email
      timeout         = "3600s"
      max_retries     = 1
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
        env {
          name  = "PARALLEL_AI_ORCHESTRATION"
          value = "1"
        }
        env {
          name  = "VA_EXECUTION_SCOPE"
          value = "cloud"
        }
        env {
          name  = "VA_PROVIDER_FANOUT"
          value = "3"
        }
        env {
          name  = "VA_MAX_COST_CLASS"
          value = "1"
        }
        env {
          name  = "VA_REVIEW_PANEL_SIZE"
          value = "3"
        }
        env {
          name  = "VA_REVIEW_PANEL_LIMIT"
          value = "2"
        }
        env {
          name  = "VA_STRICT_REVIEW_PANEL"
          value = "1"
        }
        env {
          name  = "VA_REPOSITORY_URL"
          value = var.repository_url
        }
        env {
          name  = "VA_BASELINE_SHA"
          value = var.baseline_commit
        }
        env {
          name  = "VA_BASELINE_REF"
          value = var.baseline_ref
        }
        env {
          name  = "VA_EXPECTED_DIFF_MANIFEST"
          value = "cloud-control-plane/expected-diff.discovery.json"
        }
        env {
          name  = "VA_PUBLICATION_EXPECTED"
          value = "0"
        }
        env {
          name  = "VA_PRIVATE_STAGING_BUCKET"
          value = google_storage_bucket.private_staging.name
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
