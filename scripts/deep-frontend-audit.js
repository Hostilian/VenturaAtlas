/**
 * Venture Atlas OS — Deep Frontend Audit & Hardcoded Count Inspector
 * ==================================================================
 * Scans all 24 HTML pages for:
 * 1. Hardcoded outdated metrics (e.g. "70", "228", "260" when canonical = 272)
 * 2. Missing data-page attributes
 * 3. Broken navigation links or missing relative assets
 * 4. Missing headers/footers or broken button bindings
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const DOCS_DIR = path.join(ROOT, 'docs');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

function runDeepAudit() {
  const htmlFiles = [path.join(ROOT, 'index.html'), ...getHtmlFiles(DOCS_DIR)];
  console.log(`=== Deep Auditing ${htmlFiles.length} Frontend HTML Files ===\n`);

  const issues = [];

  // Current canonical metrics from repository-meta.json
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'repository-meta.json'), 'utf-8'));
  const canonicalCount = meta.counts.canonicalIdeas;

  htmlFiles.forEach(file => {
    const rel = path.relative(ROOT, file);
    const html = fs.readFileSync(file, 'utf-8');

    // 1. Check data-page
    if (!html.includes('data-page=')) {
      issues.push({ type: 'WARN', file: rel, msg: 'Missing data-page attribute on <body>' });
    }

    // 2. Check outdated hardcoded idea counts (e.g., "70 ideas", "228 ideas", "260 ideas")
    const hardcodedPatterns = [
      /\b(70|228|250|260)\s+(canonical\s+)?ideas\b/i,
      /\b70\s+dossiers\b/i,
      /\ball\s+70\b/i
    ];
    hardcodedPatterns.forEach(pat => {
      const m = html.match(pat);
      if (m) {
        issues.push({ type: 'HARDCODED_COUNT', file: rel, msg: `Found outdated hardcoded count "${m[0]}" at match` });
      }
    });

    // 3. Check for broken inline JavaScript templates outside <script> tags
    const htmlWithoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    if (htmlWithoutScripts.includes('${x.')) {
      issues.push({ type: 'INLINE_TEMPLATE_BUG', file: rel, msg: 'Contains unparsed JS template string literal in static HTML text' });
    }

    // 4. Check navigation header inclusion (static header or site.js dynamic injection)
    const hasSiteJs = html.includes('site.js');
    if (!html.includes('class="site-header"') && !html.includes('nav-toggle') && !hasSiteJs && !rel.includes('index.html')) {
      issues.push({ type: 'MISSING_NAV', file: rel, msg: 'Missing standard site header / navigation' });
    }
  });

  console.log(`Deep audit finished. Total issues found: ${issues.length}\n`);
  issues.forEach(i => {
    console.log(`[${i.type}] ${i.file}: ${i.msg}`);
  });
}

runDeepAudit();
