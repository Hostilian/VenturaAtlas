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

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ── 0. Enable Required GCP APIs ───────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudrun.googleapis.com",
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

# ── 4. Secret Manager Secrets for Provider Aliases ───────────────────────────
resource "google_secret_manager_secret" "provider_secrets" {
  for_each = toset([
    "va-openrouter-01",
    "va-anthropic-01",
    "va-active-01",
    "va-deepseek-01",
    "va-gemini-01",
    "va-github-token"
  ])
  secret_id  = each.key
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
        image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.repo.repository_id}/venture-atlas-worker:2.3.0"
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

# ── 7. Cloud Scheduler Trigger ────────────────────────────────────────────────
resource "google_cloud_scheduler_job" "discovery_trigger" {
  name        = "venture-atlas-2hr-trigger"
  description = "Triggers Venture Atlas Autonomous Discovery Worker every 2 hours"
  schedule    = "0 */2 * * *"
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.gcp_region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.gcp_project_id}/jobs/${google_cloud_run_v2_job.venture_atlas_worker.name}:run"
    oauth_token {
      service_account_email = google_service_account.worker_sa.email
    }
  }
}
