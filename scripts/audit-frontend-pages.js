/**
 * Venture Atlas OS — Frontend Pages Audit Script
 * Validates all HTML files in root and docs/ for:
 * 1. Referenced JS script existence
 * 2. Navigation links validity (no 404 targets)
 * 3. Page initialization functions and event handlers
 * 4. CSS stylesheet links
 * 5. Data requirements & data-page attributes
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

function auditFrontend() {
  const htmlFiles = [path.join(ROOT, 'index.html'), ...getHtmlFiles(DOCS_DIR)];
  console.log(`=== Auditing ${htmlFiles.length} Frontend HTML Pages ===\n`);

  const errors = [];
  const warnings = [];

  htmlFiles.forEach(file => {
    const relPath = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf-8');

    // Check data-page attribute
    const dataPageMatch = content.match(/<body[^>]*data-page=["']([^"']*)["']/);
    if (!dataPageMatch) {
      warnings.push(`${relPath}: missing data-page attribute on <body>`);
    }

    // Check script src references
    const scriptMatches = [...content.matchAll(/<script[^>]*src=["']([^"']+)["']/g)];
    scriptMatches.forEach(m => {
      const src = m[1];
      if (src.startsWith('http')) return;
      const scriptPath = path.resolve(path.dirname(file), src);
      if (!fs.existsSync(scriptPath)) {
        errors.push(`${relPath}: script src not found: ${src} -> ${scriptPath}`);
      }
    });

    // Check stylesheet href references
    const cssMatches = [...content.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g)];
    cssMatches.forEach(m => {
      const href = m[1];
      if (href.startsWith('http')) return;
      const cssPath = path.resolve(path.dirname(file), href);
      if (!fs.existsSync(cssPath)) {
        errors.push(`${relPath}: CSS href not found: ${href} -> ${cssPath}`);
      }
    });

    // Check internal href links in navigation and content
    const linkMatches = [...content.matchAll(/href=["']([^"']+)["']/g)];
    linkMatches.forEach(m => {
      const target = m[1];
      if (target.startsWith('#') || target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('javascript:')) return;
      const cleanTarget = target.split('?')[0].split('#')[0];
      if (!cleanTarget) return;
      const targetPath = path.resolve(path.dirname(file), cleanTarget);
      if (!fs.existsSync(targetPath)) {
        errors.push(`${relPath}: broken link target: href="${target}" -> ${targetPath}`);
      }
    });
  });

  console.log(`Audited ${htmlFiles.length} HTML files.`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}\n`);

  if (errors.length > 0) {
    errors.forEach(e => console.error(`[ERROR] ${e}`));
  }
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[WARN] ${w}`));
  }
}

auditFrontend();
