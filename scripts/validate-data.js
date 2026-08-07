const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readJsonFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    return { _parseError: err.message };
  }
}

function main() {
  const isStrict = process.argv.includes('--strict');
  const errors = [];
  const warnings = [];

  const rawIdeas = readJsonFile('data/ideas.json');
  if (!rawIdeas || rawIdeas._parseError) {
    errors.push(`data/ideas.json invalid: ${rawIdeas?._parseError || 'file missing'}`);
    console.error(JSON.stringify({ errors, warnings }, null, 2));
    process.exit(1);
  }

  const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);
  const rawSources = readJsonFile('data/sources.json');
  const sources = Array.isArray(rawSources) ? rawSources : (rawSources?.sources || []);

  const rawRanks = readJsonFile('data/rankings.json');
  const ranks = Array.isArray(rawRanks) ? rawRanks : (rawRanks?.rankings || rawRanks?.legacyData || []);

  const rawRels = readJsonFile('data/relationships.json');
  const rels = Array.isArray(rawRels) ? rawRels : (rawRels?.relationships || []);

  const ideaIds = new Set();
  const slugs = new Set();
  const sourceIds = new Set(sources.map(s => s.id));

  const requiredIdeaFields = ['id', 'slug', 'name', 'category', 'oneSentenceConcept'];

  for (const idea of ideas) {
    for (const field of requiredIdeaFields) {
      if (!(field in idea) || !idea[field]) {
        errors.push(`Idea ${idea.id || '?'} missing required field: ${field}`);
      }
    }

    if (idea.id) {
      if (ideaIds.has(idea.id)) errors.push(`Duplicate idea ID: ${idea.id}`);
      ideaIds.add(idea.id);
      if (!/^idea-\d{3}$/.test(idea.id)) {
        errors.push(`Malformed idea ID format (expected idea-XXX): ${idea.id}`);
      }
    }

    if (idea.slug) {
      if (slugs.has(idea.slug)) errors.push(`Duplicate idea slug: ${idea.slug}`);
      slugs.add(idea.slug);

      const dossierPath = path.join(ROOT, 'ideas', `${idea.slug}.md`);
      if (!fs.existsSync(dossierPath)) {
        warnings.push(`Missing dossier markdown file: ideas/${idea.slug}.md`);
      }
    }

    if (idea.atAGlance?.overallScore !== undefined) {
      const score = Number(idea.atAGlance.overallScore);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.push(`Idea ${idea.id} has invalid overallScore range: ${idea.atAGlance.overallScore}`);
      }
    }

    if (Array.isArray(idea.sourceReferences)) {
      for (const sRef of idea.sourceReferences) {
        if (sRef && sourceIds.size > 0 && !sourceIds.has(sRef)) {
          warnings.push(`Idea ${idea.id} references unknown source ID: ${sRef}`);
        }
      }
    }
  }

  for (const r of ranks) {
    const items = r.items || r.rankings || [];
    for (const item of items) {
      const targetId = item.ideaId || item.id;
      if (targetId && !ideaIds.has(targetId)) {
        warnings.push(`Ranking ${r.id || 'unknown'} references non-existent idea: ${targetId}`);
      }
    }
  }

  const result = {
    ideasCount: ideas.length,
    sourcesCount: sources.length,
    rankingsCount: ranks.length,
    relationshipsCount: rels.length,
    errorsCount: errors.length,
    warningsCount: warnings.length,
    errors,
    warnings: warnings.slice(0, 10) // display top 10 warnings
  };

  console.log(JSON.stringify(result, null, 2));

  if (errors.length > 0 || (isStrict && warnings.length > 0)) {
    if (isStrict && warnings.length > 0) {
      console.error(`[STRICT MODE] Failing due to ${warnings.length} warnings.`);
    }
    process.exit(1);
  }

  console.log('[OK] Data validation passed.');
}

main();
