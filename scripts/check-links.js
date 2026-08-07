const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '_site', '.agent-state']);
const TARGET_EXTENSIONS = new Set(['.md', '.html']);

const errors = [];

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        walkDirectory(fullPath);
      }
    } else if (TARGET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      checkFileLinks(fullPath);
    }
  }
}

function checkFileLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dirPath = path.dirname(filePath);

  // Regex matching href="...", src="...", and [text](link)
  const linkRegex = /(?:href|src)=["']([^"']+)["']|\[[^\]]*\]\(([^)]+)\)/g;

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawUrl = match[1] || match[2];
    if (!rawUrl) continue;

    const url = rawUrl.trim();

    // Ignore remote URLs, mailto, tel, javascript, template literals, dynamic fragments, or absolute web schemas
    if (
      /^(https?:|mailto:|tel:|javascript:|data:|blob:|#|\${)/i.test(url) ||
      url.includes('${') ||
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      continue;
    }

    // Strip query string and fragment hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (!cleanUrl) continue;

    let targetPath;
    if (cleanUrl.startsWith('/')) {
      targetPath = path.join(ROOT, cleanUrl.slice(1));
    } else {
      targetPath = path.resolve(dirPath, cleanUrl);
    }

    if (!fs.existsSync(targetPath)) {
      const relSource = path.relative(ROOT, filePath);
      errors.push(`${relSource} -> ${cleanUrl} (Resolved: ${path.relative(ROOT, targetPath)})`);
    }
  }
}

function main() {
  walkDirectory(ROOT);

  if (errors.length > 0) {
    console.error(`[ERROR] Found ${errors.length} broken internal links:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Internal link check passed.');
}

if (require.main === module) {
  main();
}

module.exports = { walkDirectory, checkFileLinks };
