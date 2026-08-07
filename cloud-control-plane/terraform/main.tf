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
  default     = "venture-atlas-os"
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

# ── 1. GCP Secret Manager Secrets ─────────────────────────────────────────────
resource "google_secret_manager_secret" "openrouter_keys" {
  secret_id = "OPENROUTER_API_KEYS"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "anthropic_keys" {
  secret_id = "ANTHROPIC_API_KEYS"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "github_token" {
  secret_id = "GITHUB_TOKEN"
  replication {
    auto {}
  }
}

# ── 2. Service Account for Cloud Run Jobs ─────────────────────────────────────
resource "google_service_account" "worker_sa" {
  account_id   = "va-cloud-worker-sa"
  display_name = "Venture Atlas Worker Service Account"
}

resource "google_secret_manager_secret_iam_member" "openrouter_access" {
  secret_id = google_secret_manager_secret.openrouter_keys.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.worker_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "anthropic_access" {
  secret_id = google_secret_manager_secret.anthropic_keys.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.worker_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "github_access" {
  secret_id = google_secret_manager_secret.github_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.worker_sa.email}"
}

# ── 3. Cloud Run Job Definition ───────────────────────────────────────────────
resource "google_cloud_run_v2_job" "venture_atlas_worker" {
  name     = "venture-atlas-discovery-worker"
  location = var.gcp_region

  template {
    template {
      service_account = google_service_account.worker_sa.email
      containers {
        image = "gcr.io/${var.gcp_project_id}/venture-atlas-worker:latest"
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

# ── 4. Cloud Scheduler Cron Job (Runs every 2 hours) ─────────────────────────
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
