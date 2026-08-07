const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');

const FILES = [
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'PROJECT_STATUS.md'),
  path.join(ROOT, 'PROJECT_STATE.md'),
  path.join(ROOT, 'index.html')
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
    `- Canonical Ideas: ${meta.counts.canonicalIdeas}`,
    `- Staged Ideas: ${meta.counts.stagedIdeas}`,
    `- Total Ideas: ${meta.counts.totalIdeas}`,
    `- Categories: ${meta.counts.categories}`,
    `- Source References: ${meta.counts.sources}`,
    `- Generated Prompts: ${meta.counts.prompts}`,
    `- Last Updated: ${new Date().toISOString().split('T')[0]}`,
    '<!-- END GENERATED REPOSITORY STATS -->'
  ].join('\n');

  const inventoryBlock = [
    '<!-- BEGIN GENERATED CURRENT INVENTORY -->',
    `- **${meta.counts.canonicalIdeas} canonical ideas** (${meta.counts.stagedIdeas} staged, ${meta.counts.totalIdeas} total)`,
    `- **${meta.counts.categories} categories**`,
    `- **${meta.counts.sources} source inventory records**`,
    `- **${meta.counts.prompts.toLocaleString()} idea-specific prompts** plus master prompts`,
    '- One full Markdown dossier, financial model, validation plan, technical blueprint, launch plan, and 25-prompt pack per canonical idea',
    '<!-- END GENERATED CURRENT INVENTORY -->'
  ].join('\n');

  FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Update block for markdown files
    if (filePath.endsWith('.md')) {
      const statsRegex = /<!-- BEGIN GENERATED REPOSITORY STATS -->[\s\S]*?<!-- END GENERATED REPOSITORY STATS -->/g;
      if (statsRegex.test(content)) {
        content = content.replace(statsRegex, statsBlock);
      }
    }

    if (filePath.endsWith('README.md')) {
      const invRegex = /<!-- BEGIN GENERATED CURRENT INVENTORY -->[\s\S]*?<!-- END GENERATED CURRENT INVENTORY -->/g;
      if (invRegex.test(content)) {
        content = content.replace(invRegex, inventoryBlock);
      }
    } else if (filePath.endsWith('PROJECT_STATUS.md')) {
      content = content.replace(/^-\s+Canonical ideas:\s+\d+/gm, `- Canonical ideas: ${meta.counts.canonicalIdeas}`);
      content = content.replace(/^-\s+Staged ideas:\s+\d+/gm, `- Staged ideas: ${meta.counts.stagedIdeas}`);
      content = content.replace(/^-\s+Total ideas:\s+\d+/gm, `- Total ideas: ${meta.counts.totalIdeas}`);
      content = content.replace(/^-\s+Categories:\s+\d+/gm, `- Categories: ${meta.counts.categories}`);
    } else if (filePath.endsWith('PROJECT_STATE.md')) {
      content = content.replace(/^-\s+Canonical ideas:\s+\d+/gm, `- Canonical ideas: ${meta.counts.canonicalIdeas}`);
      content = content.replace(/^-\s+Staged ideas:\s+\d+/gm, `- Staged ideas: ${meta.counts.stagedIdeas}`);
      content = content.replace(/^-\s+Total ideas:\s+\d+/gm, `- Total ideas: ${meta.counts.totalIdeas}`);
      content = content.replace(/^-\s+Prompt records:\s+\d+/gm, `- Prompt records: ${meta.counts.prompts}`);
    } else if (filePath.endsWith('index.html')) {
      content = content.replace(/content="Browse \d+\+\s+evidence-backed business ideas/gi, `content="Browse ${meta.counts.canonicalIdeas}+ evidence-backed business ideas`);
      content = content.replace(/content="\d+\+\s+evidence-backed business ideas with scores/gi, `content="${meta.counts.canonicalIdeas}+ evidence-backed business ideas with scores`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated stats block and synchronized prose in ${path.basename(filePath)}`);
  });
}

main();
