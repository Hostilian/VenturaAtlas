const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const LOCK_PATH = path.join(ROOT, 'package-lock.json');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const INDEX_PATH = path.join(ROOT, 'data', 'search-index.json');

function main() {
  const errors = [];

  if (!fs.existsSync(PKG_PATH) || !fs.existsSync(LOCK_PATH)) {
    errors.push('Missing package.json or package-lock.json');
  } else {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    const lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
    if (pkg.version !== lock.version) {
      errors.push(`Version mismatch: package.json (${pkg.version}) vs package-lock.json (${lock.version})`);
    }
    if (pkg.name !== lock.name) {
      errors.push(`Package name mismatch: package.json (${pkg.name}) vs package-lock.json (${lock.name})`);
    }
  }

  if (!fs.existsSync(META_PATH)) {
    errors.push('Missing data/repository-meta.json');
  } else {
    const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    if (meta.version !== pkg.version) {
      errors.push(`Version mismatch: repository-meta.json (${meta.version}) vs package.json (${pkg.version})`);
    }
  }

  if (fs.existsSync(IDEAS_PATH) && fs.existsSync(INDEX_PATH)) {
    const ideasRaw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const ideasList = Array.isArray(ideasRaw) ? ideasRaw : (ideasRaw.ideas || []);
    const indexRaw = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

    if (ideasList.length !== indexRaw.length) {
      errors.push(`Search index drift: ideas.json (${ideasList.length}) vs search-index.json (${indexRaw.length})`);
    }
  }

  if (errors.length > 0) {
    console.error('[ERROR] Repository drift checks failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Repository drift check passed cleanly.');
}

main();
