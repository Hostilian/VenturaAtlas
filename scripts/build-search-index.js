const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IDEAS_PATH = path.join(ROOT, 'data', 'ideas.json');
const INDEX_PATH = path.join(ROOT, 'data', 'search-index.json');

function normalizeText(...strings) {
  return strings
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIndex(ideas) {
  return ideas.map(idea => {
    const name = idea.name || '';
    const concept = idea.oneSentenceConcept || idea.elevatorPitch || '';
    const problem = idea.atAGlance?.problemSolved || idea.problemStatement || '';
    const customer = idea.atAGlance?.targetCustomer || idea.customer?.idealCustomerProfile || '';
    const category = idea.category || '';
    const tags = Array.isArray(idea.tags) ? idea.tags.join(' ') : '';
    const altNames = Array.isArray(idea.alternativeNames) ? idea.alternativeNames.join(' ') : '';

    const normalizedText = normalizeText(name, concept, problem, customer, category, tags, altNames);

    return {
      schemaVersion: '2.0.0',
      id: idea.id,
      slug: idea.slug || '',
      name: idea.name,
      category: idea.category || '',
      subcategory: idea.subcategory || '',
      concept: idea.oneSentenceConcept || '',
      customer: customer,
      problem: problem,
      overallScore: Number(idea.atAGlance?.overallScore || idea.scores?.existingSpendingEvidence || 0),
      tags: Array.isArray(idea.tags) ? idea.tags : [],
      normalizedText
    };
  });
}

function main() {
  const isCheckMode = process.argv.includes('--check');

  if (!fs.existsSync(IDEAS_PATH)) {
    console.error('[ERROR] ideas.json not found');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(IDEAS_PATH, 'utf8'));
  const allIdeas = Array.isArray(raw) ? raw : (raw.ideas || []);
  
  // Strict invariant check: Exclude staged candidates
  const canonicalIdeas = allIdeas.filter(i => {
    if (i.status === 'staged' || (i.id && i.id.startsWith('candidate-'))) {
      console.warn(`[WARN] Excluding staged/candidate record ${i.id} from public search index`);
      return false;
    }
    return true;
  });

  // Verify zero candidate- records exist in canonical array
  const invalidCandidates = canonicalIdeas.filter(i => i.id && i.id.startsWith('candidate-'));
  if (invalidCandidates.length > 0) {
    console.error(`[FATAL ERROR] Candidate records starting with 'candidate-' detected in canonical search index payload: ${invalidCandidates.map(c => c.id).join(', ')}`);
    process.exit(1);
  }

  const newIndex = buildIndex(canonicalIdeas);

  if (isCheckMode) {
    if (!fs.existsSync(INDEX_PATH)) {
      console.error('[ERROR] search-index.json does not exist');
      process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    if (current.length !== newIndex.length) {
      console.error(`[ERROR] search-index.json size mismatch (${current.length} vs ${newIndex.length})`);
      process.exit(1);
    }
    console.log('[OK] search-index.json is current');
    process.exit(0);
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(newIndex, null, 2) + '\n', 'utf8');
  console.log(`[OK] Wrote ${newIndex.length} compact search records to search-index.json`);
}

if (require.main === module) {
  main();
}

module.exports = { buildIndex, normalizeText };
