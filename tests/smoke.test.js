const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.resolve(__dirname, '..');

for (const p of ['index.html', 'assets/css/site.css', 'assets/js/site.js', 'data/ideas.json', 'data/rankings.json', 'docs/idea.html']) {
  assert(fs.existsSync(path.join(root, p)), `Missing required file ${p}`);
}

const raw = JSON.parse(fs.readFileSync(path.join(root, 'data/ideas.json')));
const ideas = Array.isArray(raw) ? raw : (raw.ideas || []);
assert(ideas.length >= 60, 'ideas.length should be >= 60');
assert(ideas.every(x => x.id && x.name), 'all ideas must have id and name');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').toLowerCase().includes('directory'), 'index.html should include directory section');

console.log('Smoke tests passed');
