const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');

const FILES = [
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'PROJECT_STATUS.md'),
  path.join(ROOT, 'PROJECT_STATE.md')
];

function main() {
  if (!fs.existsSync(META_PATH)) {
    console.error('repository-meta.json not found');
    process.exit(1);
  }

  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const statsBlock = [
    '<!-- BEGIN GENERATED REPOSITORY STATS -->',
    `- Repository Version: ${meta.version}`,
    `- Canonical Ideas: ${meta.counts.ideas}`,
    `- Categories: ${meta.counts.categories}`,
    `- Source References: ${meta.counts.sources}`,
    `- Generated Prompts: ${meta.counts.prompts}`,
    `- Last Updated: ${new Date().toISOString().split('T')[0]}`,
    '<!-- END GENERATED REPOSITORY STATS -->'
  ].join('\n');

  FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /<!-- BEGIN GENERATED REPOSITORY STATS -->[\s\S]*?<!-- END GENERATED REPOSITORY STATS -->/g;

    if (regex.test(content)) {
      content = content.replace(regex, statsBlock);
    } else {
      content = content + '\n\n' + statsBlock + '\n';
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated stats block in ${path.basename(filePath)}`);
  });
}

main();
