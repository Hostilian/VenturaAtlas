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
const categoriesInIdeas = new Set();

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

  if (idea.category) {
    categoriesInIdeas.add(idea.category);
  }
}

// 3. Metadata count alignment (P59)
const rawQueue = readJson('data/idea-staging-queue.json');
const stagingQueueLen = Array.isArray(rawQueue) ? rawQueue.length : (rawQueue?.queue?.length || 0);

if (meta && meta.counts) {
  if (meta.counts.canonicalIdeas !== undefined && meta.counts.canonicalIdeas !== ideas.length) {
    errors.push(`Stale repository-meta.json: canonicalIdeas count (${meta.counts.canonicalIdeas}) does not match ideas.json length (${ideas.length})`);
  }
  const expectedTotal = ideas.length + stagingQueueLen;
  if (meta.counts.totalIdeas !== undefined && meta.counts.totalIdeas !== expectedTotal) {
    errors.push(`Stale repository-meta.json: totalIdeas count (${meta.counts.totalIdeas}) does not match canonical (${ideas.length}) + staging (${stagingQueueLen}) = ${expectedTotal}`);
  }
  if (meta.counts.categories !== undefined && meta.counts.categories !== categoriesInIdeas.size) {
    errors.push(`Stale repository-meta.json: categories count (${meta.counts.categories}) does not match unique categories in ideas.json (${categoriesInIdeas.size})`);
  }
}

// 4. Search index freshness
const searchIndex = readJson('data/search-index.json');
if (searchIndex) {
  const searchRecords = Array.isArray(searchIndex) ? searchIndex : (searchIndex.records || []);
  if (searchRecords.length !== ideas.length) {
    errors.push(`Search index count mismatch: data/search-index.json has ${searchRecords.length} records, but data/ideas.json has ${ideas.length} ideas`);
  }
}

// 5. Sources validation
const rawSources = readJson('data/sources.json');
const sources = Array.isArray(rawSources) ? rawSources : (rawSources?.sources || []);
const sourceIds = new Set(sources.map(s => s.id).filter(Boolean));

for (const idea of ideas) {
  if (Array.isArray(idea.sourceReferences)) {
    for (const ref of idea.sourceReferences) {
      if (typeof ref === 'string' && ref.startsWith('src-') && !sourceIds.has(ref)) {
        warnings.push(`Idea ${idea.id} references non-existent source ID: ${ref}`);
      }
    }
  }
}

// 6. Rankings validation
const rawRankings = readJson('data/rankings.json');
const rankingsList = Array.isArray(rawRankings) ? rawRankings : (rawRankings?.rankings || []);
if (rankingsList.length > 0 && Array.isArray(rankingsList[0].items)) {
  const items = rankingsList[0].items;
  for (const item of items) {
    const id = item.id || item.ideaId;
    if (id && !ideaIds.has(id)) {
      errors.push(`Rankings references non-existent idea ID: ${id}`);
    }
  }
}

// 7. Categories validation
const rawCategories = readJson('data/categories.json');
const categoriesList = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.categories || []);
if (categoriesList.length > 0) {
  for (const cat of categoriesList) {
    if (Array.isArray(cat.ideaIds)) {
      for (const id of cat.ideaIds) {
        if (!ideaIds.has(id)) {
          errors.push(`Category '${cat.name || cat.id}' references non-existent idea ID: ${id}`);
        }
      }
    }
  }
}

// 8. Manifest Icon Check
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

// 9. Sitemap Placeholder Check
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
