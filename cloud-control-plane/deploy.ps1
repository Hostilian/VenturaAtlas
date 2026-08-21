param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [string]$Region = "europe-west1",
  [string]$RepositoryUrl = "https://github.com/Hostilian/VenturaAtlas.git",
  [string]$HermesBaseUrl = "",
  [string]$Terraform = "terraform"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$terraformDir = Join-Path $PSScriptRoot "terraform"
$billing = gcloud billing projects describe $ProjectId --format="value(billingEnabled)"
if ($billing -ne "True") {
  throw "Project '$ProjectId' has no enabled billing account. Deployment intentionally stopped before creating resources."
}
if (-not (Get-Command $Terraform -ErrorAction SilentlyContinue)) {
  throw "Terraform 1.5+ is required and was not found."
}

Push-Location $terraformDir
try {
  & $Terraform init
  & $Terraform apply -auto-approve `
    -var="gcp_project_id=$ProjectId" `
    -var="gcp_region=$Region" `
    -var="repository_url=$RepositoryUrl" `
    -var="hermes_base_url=$HermesBaseUrl" `
    -var="private_staging_bucket_name=$ProjectId-venture-atlas-private-staging" `
    -var="worker_image=europe-west1-docker.pkg.dev/cloudrun/container/hello@sha256:1f73a45b7d9a69ead8f2f72c3cb1c5953110373a915e9e5b58be6db4d99ccf57" `
    -target=google_artifact_registry_repository.repo `
    -target=google_secret_manager_secret.provider_secrets
} finally {
  Pop-Location
}

$requiredSecrets = @("va-openrouter-01", "va-anthropic-01", "va-active-01", "va-deepseek-01", "va-nvidia-nim-01", "va-cohere-01")
$configuredSecrets = 0
foreach ($secret in $requiredSecrets) {
  $versions = gcloud secrets versions list $secret --project $ProjectId --filter="state=ENABLED" --format="value(name)" 2>$null
  if ($versions) { $configuredSecrets += 1 }
}
if ($configuredSecrets -lt 3) {
  throw "Only $configuredSecrets provider secret pools have enabled versions. Add at least three; secret values are never copied from GitHub automatically."
}

$tag = "$Region-docker.pkg.dev/$ProjectId/venture-atlas-repo/worker:$(git -C $root rev-parse --short=12 HEAD)"
gcloud builds submit $root --project $ProjectId --config (Join-Path $PSScriptRoot "cloudbuild.yaml") --substitutions="_IMAGE=$tag"
$digest = gcloud artifacts docker images describe $tag --project $ProjectId --format="value(image_summary.digest)"
if ($digest -notmatch '^sha256:[0-9a-f]{64}$') {
  throw "Cloud Build completed but an immutable image digest could not be resolved."
}

Push-Location $terraformDir
try {
  & $Terraform apply -auto-approve `
    -var="gcp_project_id=$ProjectId" `
    -var="gcp_region=$Region" `
    -var="repository_url=$RepositoryUrl" `
    -var="hermes_base_url=$HermesBaseUrl" `
    -var="private_staging_bucket_name=$ProjectId-venture-atlas-private-staging" `
    -var="worker_image=$Region-docker.pkg.dev/$ProjectId/venture-atlas-repo/worker@$digest"
} finally {
  Pop-Location
}

gcloud run jobs execute venture-atlas-discovery-worker --project $ProjectId --region $Region --wait
python (Join-Path $PSScriptRoot "preflight.py") --project $ProjectId --region $Region
