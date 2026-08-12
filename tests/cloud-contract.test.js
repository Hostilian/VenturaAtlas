const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

test('Cloud Run job scheduler contract is authenticated and immutable', () => {
  const terraform = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'terraform', 'main.tf'), 'utf8');
  assert.match(terraform, /"run\.googleapis\.com"/);
  assert.doesNotMatch(terraform, /"cloudrun\.googleapis\.com"/);
  assert.match(terraform, /https:\/\/run\.googleapis\.com\/v2\/projects\/\$\{var\.gcp_project_id\}\/locations\/\$\{var\.gcp_region\}\/jobs\//);
  assert.match(terraform, /resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker"/);
  assert.match(terraform, /role\s*=\s*"roles\/run\.invoker"/);
  assert.match(terraform, /service_account_email\s*=\s*google_service_account\.scheduler_sa\.email/);
  assert.match(terraform, /image\s*=\s*var\.worker_image/);
  assert.match(terraform, /@sha256:\[0-9a-f\]\{64\}\$/);
  assert.doesNotMatch(terraform, /venture-atlas-worker:2\.3\.0/);
});

test('Terraform and job runner share exact Secret Manager IDs', () => {
  const terraform = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'terraform', 'main.tf'), 'utf8');
  const runner = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'job_runner.py'), 'utf8');
  const expected = {
    OPENROUTER_API_KEYS: 'va-openrouter-01',
    ANTHROPIC_API_KEYS: 'va-anthropic-01',
    ACTIVE_API_KEYS: 'va-active-01',
    DEEPSEEK_API_KEYS: 'va-deepseek-01',
    NVIDIA_NIM_API_KEYS: 'va-nvidia-nim-01',
    COHERE_API_KEYS: 'va-cohere-01'
  };
  for (const [environmentName, secretId] of Object.entries(expected)) {
    const terraformMapping = new RegExp(`${environmentName}\\s*=\\s*["']${secretId}["']`);
    assert.match(terraform, terraformMapping);
    assert.ok(runner.includes(`"${environmentName}": "${secretId}"`));
  }
  assert.match(runner, /SECRET_IDS\.get\(secret_name, secret_name\)/);
  assert.doesNotMatch(terraform, /GITHUB_TOKEN\s*=\s*["']va-github-token["']/);
});

test('Cloud job prevents overlapping repository writers and bounds provider cost', () => {
  const terraform = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'terraform', 'main.tf'), 'utf8');
  assert.match(terraform, /task_count\s*=\s*1/);
  assert.match(terraform, /parallelism\s*=\s*1/);
  assert.match(terraform, /max_retries\s*=\s*1/);
  assert.match(terraform, /name\s*=\s*"VA_PROVIDER_FANOUT"[\s\S]*?value\s*=\s*"2"/);
  assert.match(terraform, /name\s*=\s*"VA_MAX_COST_CLASS"[\s\S]*?value\s*=\s*"1"/);
});

test('Orchestrator never disables TLS certificate verification', () => {
  const orchestrator = fs.readFileSync(path.join(ROOT, 'scripts', 'va_orchestrator.py'), 'utf8');
  assert.doesNotMatch(orchestrator, /_create_unverified_context|CERTIFICATE_VERIFY_FAILED/);
  assert.match(orchestrator, /ssl\.create_default_context\(\)/);
});

test('GitHub publication keeps credentials out of process arguments and Git config', () => {
  const runner = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'job_runner.py'), 'utf8');
  const askpass = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'git_askpass.py'), 'utf8');
  assert.doesNotMatch(runner, /extraHeader|AUTHORIZATION: basic|x-access-token:\{github_token\}/i);
  assert.match(runner, /environment\["VA_GITHUB_TOKEN"\] = github_token/);
  assert.match(runner, /environment\["GIT_ASKPASS"\]/);
  assert.match(runner, /\["git", "push", "origin", branch\]/);
  assert.match(askpass, /os\.environ\.get\("VA_GITHUB_TOKEN", ""\)/);
});

test('Cloud publication freezes a checkout and enforces an exact diff manifest', () => {
  const runner = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'job_runner.py'), 'utf8');
  const terraform = fs.readFileSync(path.join(ROOT, 'cloud-control-plane', 'terraform', 'main.tf'), 'utf8');
  assert.match(runner, /VA_BASELINE_SHA/);
  assert.match(runner, /VA_EXPECTED_DIFF_MANIFEST/);
  assert.match(runner, /unexpected autonomous diff paths/);
  assert.match(runner, /missing expected autonomous diff paths/);
  assert.match(runner, /staged diff closure mismatch/);
  assert.match(runner, /committed tree differs from validated staged tree/);
  assert.doesNotMatch(runner, /skipping git push/);
  assert.match(terraform, /public_access_prevention\s*=\s*"enforced"/);
  assert.match(terraform, /name\s*=\s*"VA_PRIVATE_STAGING_BUCKET"/);
  assert.match(terraform, /name\s*=\s*"VA_PUBLICATION_EXPECTED"[\s\S]*?value\s*=\s*"0"/);
  assert.match(runner, /if_generation_match=precondition/);
  assert.match(runner, /private paths cannot be published to Git/);
});
