const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const QUEUE_PATH = path.join(ROOT, 'data', 'idea-staging-queue.json');
const CATEGORIES_PATH = path.join(ROOT, 'data', 'categories.json');
const SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');
const RANKINGS_PATH = path.join(ROOT, 'data', 'rankings.json');
const PROMPTS_DIR = path.join(ROOT, 'prompts', 'idea-specific');
const DOSSIERS_DIR = path.join(ROOT, 'ideas');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

function computeFileHash(filePath) {
  if (!fs.existsSync(filePath)) return { sha256: null, bytes: 0 };
  const content = fs.readFileSync(filePath);
  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  return { sha256, bytes: content.length };
}

function getRepositoryTruth(options = {}) {
  const includePrivateStaging = options.includePrivateStaging !== false;
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const version = pkg.version || '2.3.0';

  let canonicalIdeasCount = 0;
  const canonicalCategoryLabels = new Set();

  if (fs.existsSync(IDEAS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || []);
    canonicalIdeasCount = list.length;
    list.forEach(i => {
      if (i.category) canonicalCategoryLabels.add(i.category);
    });
  }

  let stagedCandidateCount = 0;
  if (includePrivateStaging && fs.existsSync(QUEUE_PATH)) {
    const raw = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.ideas || raw.queue || []);
    stagedCandidateCount = list.length;
  }

  let taxonomyCategoryCount = 0;
  if (fs.existsSync(CATEGORIES_PATH)) {
    const raw = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.categories || []);
    taxonomyCategoryCount = list.length;
  }

  let sourceRecordCount = 0;
  if (fs.existsSync(SOURCES_PATH)) {
    const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.sources || []);
    sourceRecordCount = list.length;
  }

  let rankingViewCount = 0;
  let rankingEntryCount = 0;
  if (fs.existsSync(RANKINGS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.rankings || []);
    rankingViewCount = list.length;
    if (list.length > 0 && Array.isArray(list[0].items)) {
      rankingEntryCount = list[0].items.length;
    }
  }

  let promptFileCount = 0;
  if (fs.existsSync(PROMPTS_DIR)) {
    const dirs = fs.readdirSync(PROMPTS_DIR);
    dirs.forEach(d => {
      const pDir = path.join(PROMPTS_DIR, d);
      if (fs.statSync(pDir).isDirectory()) {
        const files = fs.readdirSync(pDir).filter(f => f.endsWith('.md') && f !== 'README.md');
        if (files.length > 0) {
          promptFileCount += files.length;
        } else if (fs.existsSync(path.join(pDir, 'README.md'))) {
          const readmeText = fs.readFileSync(path.join(pDir, 'README.md'), 'utf8');
          const matches = readmeText.match(/^###?\s+Prompt\s+\d+/gm);
          promptFileCount += matches ? matches.length : 0;
        }
      }
    });
  }

  let dossierCount = 0;
  if (fs.existsSync(DOSSIERS_DIR)) {
    dossierCount = fs.readdirSync(DOSSIERS_DIR).filter(f => f.endsWith('.md') && f !== 'README.md').length;
  }

  const countMdFiles = (dirRel) => {
    const p = path.join(ROOT, dirRel);
    if (!fs.existsSync(p)) return 0;
    return fs.readdirSync(p).filter(f => f.endsWith('.md') && f !== 'README.md').length;
  };

  const financialModelCount = countMdFiles('financial-models');
  const validationPlanCount = countMdFiles('validation-plans');
  const technicalBlueprintCount = countMdFiles('technical-blueprints');
  const launchPlanCount = countMdFiles('launch-plans');

  const totalPortfolioRecords = canonicalIdeasCount + stagedCandidateCount;

  // Component Revisions
  const canonicalRevision = computeFileHash(IDEAS_PATH).sha256?.substring(0, 16) || 'none';
  const stagingRevision = includePrivateStaging ? (computeFileHash(QUEUE_PATH).sha256?.substring(0, 16) || 'none') : 'private-withheld';
  const taxonomyRevision = computeFileHash(CATEGORIES_PATH).sha256?.substring(0, 16) || 'none';
  const sourcesRevision = computeFileHash(SOURCES_PATH).sha256?.substring(0, 16) || 'none';
  const rankingsRevision = computeFileHash(RANKINGS_PATH).sha256?.substring(0, 16) || 'none';

  // Master Data Revision (Canonical Data)
  const masterHasher = crypto.createHash('sha256');
  [IDEAS_PATH, CATEGORIES_PATH, SOURCES_PATH, RANKINGS_PATH].forEach(fp => {
    if (fs.existsSync(fp)) {
      masterHasher.update(fs.readFileSync(fp));
    }
  });
  const canonicalDataRevision = masterHasher.digest('hex').substring(0, 16);

  const fileManifests = {};
  const manifestFiles = [
    'data/ideas.json',
    'data/categories.json',
    'data/sources.json',
    'data/rankings.json'
  ];
  if (includePrivateStaging) manifestFiles.splice(1, 0, 'data/idea-staging-queue.json');
  manifestFiles.forEach(relFile => {
    const full = path.join(ROOT, relFile);
    const hashObj = computeFileHash(full);
    fileManifests[path.basename(relFile)] = {
      sha256: hashObj.sha256,
      bytes: hashObj.bytes
    };
  });

  return {
    version,
    schemaVersion: '2.0.0',
    privateStagingIncluded: includePrivateStaging,
    canonicalDataRevision,
    revisions: {
      canonicalRevision,
      stagingRevision,
      taxonomyRevision,
      sourcesRevision,
      rankingsRevision,
      canonicalDataRevision
    },
    counts: {
      ideas: canonicalIdeasCount,
      canonicalIdeas: canonicalIdeasCount,
      stagedIdeas: stagedCandidateCount,
      totalIdeas: totalPortfolioRecords,
      categories: canonicalCategoryLabels.size,
      canonicalCategoryLabels: canonicalCategoryLabels.size,
      taxonomyCategories: taxonomyCategoryCount,
      sources: sourceRecordCount,
      rankingViews: rankingViewCount,
      rankingEntries: rankingEntryCount,
      prompts: promptFileCount,
      dossiers: dossierCount,
      financialModels: financialModelCount,
      validationPlans: validationPlanCount,
      technicalBlueprints: technicalBlueprintCount,
      launchPlans: launchPlanCount
    },
    files: fileManifests
  };
}

module.exports = {
  getRepositoryTruth,
  computeFileHash
};
