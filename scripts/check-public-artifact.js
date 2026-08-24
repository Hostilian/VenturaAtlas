const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '_site');
const INTERNAL_SOURCE_TERMS = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'))
    .filter(source => source.visibility !== 'PUBLIC')
    .flatMap(source => [source.id, source.title].filter(Boolean))
);

const FORBIDDEN_FILE_PATTERNS = [
  /\.env(\..*)?$/i,
  /node_modules/i,
  /^\.git/i,
  /^\.agent-state/i,
  /^\.agents/i,
  /^\.codex/i,
  /^apps/i,
  /^tests/i,
  /^scripts/i,
  /idea-staging-queue\.json$/i,
  /^data\/sources\.json$/i,
  /^data\/build-manifest\.json$/i,
  /^research\/(audits|original-chat|constitution)(\/|$)/i,
  /^meeting-packets(\/|$)/i,
  /^prompts\/original(?:\/|-|$)/i,
  /^prompts\/reconstructed-repository-build-prompt\.md$/i,
  /^docs\/REPO_AUDIT/i,
  /^ideas(\/|$)/i,
  /^rankings(\/|$)/i,
  /(^|\/)AGENTS(?:\.override)?\.md$/i,
  /provider-state\.json$/i,
  /package(-lock)?\.json$/i,
  /tsconfig.*\.json$/i,
  /\.ts$/i,
  /\.py$/i
];

const SECRET_CONTENT_PATTERNS = [
  { name: 'Generic OpenAI-style Secret API Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'OpenRouter Secret API Key', regex: /sk-or-v1-[a-zA-Z0-9_-]{20,}/ },
  { name: 'Anthropic Secret API Key', regex: /sk-ant-[a-zA-Z0-9_-]{20,}/ },
  { name: 'Google AI API Key', regex: /AIzaSy[a-zA-Z0-9_-]{33}/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[a-zA-Z0-9]{36,}/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[a-zA-Z0-9]{16,}/ },
  { name: 'Stripe Webhook Secret', regex: /whsec_[a-zA-Z0-9]{16,}/ },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'JSON Web Token', regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
  { name: 'RSA/EC Private Key Header', regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/ },
  { name: 'Hardcoded Authorization Header', regex: /Authorization:\s*Bearer\s+[a-zA-Z0-9._-]{20,}/i },
  { name: 'Local Windows User Path Exposure', regex: /(?:[a-zA-Z]:\\Users\\[a-zA-Z0-9_.-]+|file:\/{3}[a-zA-Z]:\/Users\/[a-zA-Z0-9_.-]+)/i }
];

function checkDirectory(dirPath) {
  const errors = [];
  if (!fs.existsSync(dirPath)) {
    return [`_site directory does not exist`];
  }

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = path.relative(DIST, fullPath).replace(/\\/g, '/');

      // 1. Path/Filename Security Gate
      for (const pattern of FORBIDDEN_FILE_PATTERNS) {
        if (pattern.test(relPath) || pattern.test(entry.name)) {
          errors.push(`Forbidden file/dir found in _site: ${relPath}`);
        }
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        // 2. Content Secret Scanner Gate for text files
        const ext = path.extname(entry.name).toLowerCase();
        if (['.html', '.js', '.json', '.css', '.md', '.txt', '.xml', '.csv'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            for (const item of SECRET_CONTENT_PATTERNS) {
              if (item.regex.test(content)) {
                errors.push(`Secret content pattern '${item.name}' detected in _site/${relPath}`);
              }
            }
            for (const term of INTERNAL_SOURCE_TERMS) {
              if (content.includes(term)) {
                errors.push(`Internal source metadata '${term}' detected in _site/${relPath}`);
              }
            }
          } catch (e) {
            // Ignore binary read errors
          }
        }
      }
    }
  }

  walk(dirPath);
  return errors;
}

function main() {
  console.log('=== Checking Public Artifact Security & Secret Scanning (_site) ===\n');
  const errors = checkDirectory(DIST);

  if (errors.length > 0) {
    console.error(`[ERROR] Security audit failed for _site artifact:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Public artifact security and secret content scan passed cleanly.');
}

if (require.main === module) {
  main();
}

module.exports = { checkDirectory, SECRET_CONTENT_PATTERNS };
