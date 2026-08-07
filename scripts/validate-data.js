const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');

const readRaw = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const rawIdeas = readRaw('data/ideas.json');
const ideas = Array.isArray(rawIdeas) ? rawIdeas : (rawIdeas.ideas || []);

const sources = readRaw('data/sources.json');

const rawRanks = readRaw('data/rankings.json');
const ranks = Array.isArray(rawRanks) ? rawRanks : (rawRanks.rankings || rawRanks.legacyData || []);

const prompts = readRaw('data/prompts.json');
const rels = readRaw('data/relationships.json');

const errors = [], warnings = [];
const ids = new Set(), slugs = new Set(), sourceIds = new Set(sources.map(x => x.id));
const required = ['id', 'slug', 'name'];

for (const x of ideas) {
  for (const k of required) if (!(k in x)) errors.push(`${x.id || '?'} missing ${k}`);
  if (ids.has(x.id)) errors.push(`duplicate id ${x.id}`);
  ids.add(x.id);
  if (slugs.has(x.slug)) errors.push(`duplicate slug ${x.slug}`);
  slugs.add(x.slug);
  if (!/^idea-\d{3}$/.test(x.id)) errors.push(`bad id ${x.id}`);

  const md = path.join(root, 'ideas', x.slug + '.md');
  if (!fs.existsSync(md)) warnings.push(`missing dossier ${x.slug}`);
}

for (const r of ranks) {
  const items = r.items || r.rankings || [];
  for (const it of items) {
    const targetId = it.ideaId || it.id;
    if (targetId && !ids.has(targetId)) warnings.push(`ranking ${r.id} unknown ${targetId}`);
  }
}

console.log(JSON.stringify({
  ideas: ideas.length,
  sources: sources.length,
  rankings: ranks.length,
  errors,
  warnings: warnings.length
}, null, 2));

if (errors.length) process.exit(1);
