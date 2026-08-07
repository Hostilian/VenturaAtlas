const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

function checkFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    errors.push(`Missing required file: ${relPath}`);
    return null;
  }
  return full;
}

function readJson(relPath) {
  const full = checkFile(relPath);
  if (!full) return null;
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    errors.push(`Failed to parse JSON in ${relPath}: ${err.message}`);
    return null;
  }
}

// 1. Package & Version Synchronization
const pkg = readJson('package.json');
const meta = readJson('data/repository-meta.json');
const pkgVersion = pkg?.version || 'UNKNOWN';

if (meta && meta.version !== pkgVersion) {
  errors.push(`Version mismatch: package.json is ${pkgVersion} but repository-meta.json is ${meta.version}`);
}

const swPath = checkFile('sw.js');
if (swPath) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const swMatch = swContent.match(/const\s+CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (swMatch) {
    const swVersion = swMatch[1];
    if (swVersion !== pkgVersion) {
      errors.push(`Version mismatch: package.json is ${pkgVersion} but sw.js CACHE_VERSION is ${swVersion}`);
    }
  } else {
    errors.push('Could not locate CACHE_VERSION in sw.js');
  }

  // Verify REQUIRED_SHELL files
  const shellMatch = swContent.match(/const\s+REQUIRED_SHELL\s*=\s*\[([\s\S]*?)\];/);
  if (shellMatch) {
    const rawPaths = shellMatch[1].split(',').map(s => s.trim().replace(/['"\s]/g, '')).filter(Boolean);
    for (const relPath of rawPaths) {
      const cleanPath = relPath.replace(/^\.\//, '');
      const full = path.join(ROOT, cleanPath);
      if (!fs.existsSync(full)) {
        errors.push(`sw.js REQUIRED_SHELL references missing file: ${cleanPath}`);
      }
    }
  }
}

// 2. Data Integrity Checks
const rawIdeas = readJson('data/ideas.json');
const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas?.ideas || []);

const ideaIds = new Set();
const ideaSlugs = new Set();

for (const idea of ideas) {
  if (idea.id) {
    if (ideaIds.has(idea.id)) {
      errors.push(`Duplicate idea ID: ${idea.id}`);
    }
    ideaIds.add(idea.id);
  } else {
    errors.push('Idea record missing ID');
  }

  if (idea.slug) {
    if (ideaSlugs.has(idea.slug)) {
      errors.push(`Duplicate idea slug: ${idea.slug}`);
    }
    ideaSlugs.add(idea.slug);
  }
}

// 3. Manifest Icon Check
const manifest = readJson('manifest.webmanifest');
if (manifest && Array.isArray(manifest.icons)) {
  if (manifest.icons.length === 0) {
    errors.push('manifest.webmanifest contains an empty icons array');
  }
  for (const icon of manifest.icons) {
    if (icon.src) {
      const cleanSrc = icon.src.replace(/^\.\//, '');
      const fullIcon = path.join(ROOT, cleanSrc);
      if (!fs.existsSync(fullIcon)) {
        errors.push(`manifest.webmanifest icon not found: ${cleanSrc}`);
      }
    }
  }
}

// 4. Sitemap Placeholder Check
const sitemapPath = checkFile('sitemap.xml');
if (sitemapPath) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  if (sitemapContent.includes('USERNAME') || sitemapContent.includes('REPOSITORY')) {
    errors.push('sitemap.xml contains unresolved placeholder tokens (USERNAME or REPOSITORY)');
  }
}

// Output summary
console.log(`[CHECK-CONSISTENCY] Checked ${ideas.length} ideas. Errors: ${errors.length}, Warnings: ${warnings.length}`);

if (warnings.length > 0) {
  warnings.forEach(w => console.warn(`  [WARN] ${w}`));
}

if (errors.length > 0) {
  errors.forEach(e => console.error(`  [FAIL] ${e}`));
  process.exit(1);
}

console.log('[OK] Repository consistency check passed cleanly.');
