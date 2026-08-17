#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOTS = ['apps/', 'assets/js/', 'cloud-control-plane/', 'scripts/', 'services/', 'tests/'];
const SOURCE_EXTENSIONS = new Set(['.js', '.ts', '.py']);

function inspectBuffer(buffer) {
  const issues = [];
  if (buffer.includes(0)) issues.push('contains NUL byte');
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    issues.push('contains UTF-8 BOM');
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    issues.push('is not valid UTF-8');
    return issues;
  }
  const text = buffer.toString('utf8');
  const crlf = (text.match(/\r\n/g) || []).length;
  const withoutCrlf = text.replace(/\r\n/g, '');
  const lf = (withoutCrlf.match(/\n/g) || []).length;
  const cr = (withoutCrlf.match(/\r/g) || []).length;
  const kinds = [crlf, lf, cr].filter(count => count > 0).length;
  if (kinds > 1 || cr > 0) issues.push('uses mixed or legacy line endings');
  return issues;
}

function normalizeBuffer(buffer) {
  let text = buffer.toString('utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const crlf = (text.match(/\r\n/g) || []).length;
  const withoutCrlf = text.replace(/\r\n/g, '');
  const lf = (withoutCrlf.match(/\n/g) || []).length;
  const cr = (withoutCrlf.match(/\r/g) || []).length;
  const lineEnding = crlf >= lf + cr ? '\r\n' : '\n';
  return Buffer.from(text.replace(/\r\n|\r|\n/g, lineEnding), 'utf8');
}

function trackedSourceFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error('git ls-files failed; format scope cannot be established');
  return result.stdout.split('\0').filter(Boolean).filter(file =>
    SOURCE_ROOTS.some(root => file.startsWith(root)) && SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );
}

function checkFiles(files, write = false) {
  const failures = [];
  let changed = 0;
  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const buffer = fs.readFileSync(absolutePath);
    let issues = inspectBuffer(buffer);
    if (write && issues.length > 0 && !issues.includes('contains NUL byte') && !issues.includes('is not valid UTF-8')) {
      const normalized = normalizeBuffer(buffer);
      if (!buffer.equals(normalized)) {
        fs.writeFileSync(absolutePath, normalized);
        changed += 1;
      }
      issues = inspectBuffer(normalized);
    }
    if (issues.length > 0) failures.push({ path: relativePath, issues });
  }
  return { checked: files.length, changed, failures };
}

if (require.main === module) {
  const write = process.argv.includes('--write');
  try {
    const result = checkFiles(trackedSourceFiles(), write);
    for (const failure of result.failures) {
      console.error(`[FORMAT] ${failure.path}: ${failure.issues.join('; ')}`);
    }
    console.log(
      `[FORMAT] checked ${result.checked} tracked JS/TS/Python source files under ${SOURCE_ROOTS.join(', ')}`
      + (write ? `; normalized ${result.changed}` : ''),
    );
    if (result.failures.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`[FORMAT] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { checkFiles, inspectBuffer, normalizeBuffer, trackedSourceFiles };
