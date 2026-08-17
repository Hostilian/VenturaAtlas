const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'data', 'repository-meta.json');

const FILES = [
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'PROJECT_STATUS.md'),
  path.join(ROOT, 'PROJECT_STATE.md'),
  path.join(ROOT, 'ARCHITECTURE.md'),
  path.join(ROOT, 'SEARCH_AND_DISCOVERY_GUIDE.md'),
  path.join(ROOT, 'index.html')
];

function synchronizeArchitecture(content, meta) {
  return content
    .replace(
      /(?:serving [\d,]+\+ canonical & staged startup dossiers|tracking [\d,]+ repository records; the public site serves [\d,]+ canonical records and [\d,]+ dossier files)/g,
      `tracking ${meta.counts.totalIdeas} repository records; the public site serves ${meta.counts.canonicalIdeas} canonical records and ${meta.counts.dossiers} dossier files`
    )
    .replace(
      /[\d,]+\+ generated prompt packs/g,
      `${meta.counts.prompts.toLocaleString()}+ generated prompt packs`
    );
}

function synchronizeHomepage(content, meta) {
  return content
    .replace(
      /(<meta\s+name="description"\s+content="Browse\s+)\d+\+/i,
      `$1${meta.counts.canonicalIdeas}+`
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")\d+\+/i,
      `$1${meta.counts.canonicalIdeas}+`
    )
    .replace(/Browse &amp; search \d+\+ ideas/g, `Browse &amp; search ${meta.counts.canonicalIdeas}+ ideas`)
    .replace(/<span data-total-ideas>\d+<\/span>/g, `<span data-total-ideas>${meta.counts.canonicalIdeas}</span>`)
    .replace(/<span data-total-categories>\d+<\/span>/g, `<span data-total-categories>${meta.counts.categories}</span>`)
    .replace(/<span data-total-sources>\d+<\/span>/g, `<span data-total-sources>${meta.counts.sources}</span>`)
    .replace(/<span data-total-prompts>\d+<\/span>/g, `<span data-total-prompts>${meta.counts.prompts}</span>`);
}

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
    `- **${meta.counts.dossiers} dossier files** (includes orphan/legacy records; not a one-to-one completeness claim)`,
    `- **${meta.counts.financialModels}/${meta.counts.canonicalIdeas} financial models**, **${meta.counts.validationPlans}/${meta.counts.canonicalIdeas} validation plans**, **${meta.counts.technicalBlueprints}/${meta.counts.canonicalIdeas} technical blueprints**, and **${meta.counts.launchPlans}/${meta.counts.canonicalIdeas} launch plans**`,
    `- **${meta.counts.prompts.toLocaleString()} idea-specific prompt files**; per-idea pack completeness is not asserted`,
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
    } else if (filePath.endsWith('ARCHITECTURE.md')) {
      content = synchronizeArchitecture(content, meta);
    } else if (filePath.endsWith('SEARCH_AND_DISCOVERY_GUIDE.md')) {
      content = content.replace(/all \d+\+ ideas/g, `all ${meta.counts.canonicalIdeas}+ ideas`);
    } else if (filePath.endsWith('index.html')) {
      content = synchronizeHomepage(content, meta);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated stats block and synchronized prose in ${path.basename(filePath)}`);
  });
}

if (require.main === module) {
  main();
}

module.exports = { synchronizeArchitecture, synchronizeHomepage };
