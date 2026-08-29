/**
 * tests/browser/smoke-errors.test.js
 * Offline DOM structural and smoke assertions using Node test runner.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Browser Static Smoke Contract Suite', async (t) => {
  const pages = ['index.html', 'offline.html', '404.html', 'docs/components.html'];

  for (const pageRel of pages) {
    await t.test(`Smoke Check: ${pageRel} is structurally sound and secret-free`, () => {
      const fullPath = path.resolve(process.cwd(), pageRel);
      assert.ok(fs.existsSync(fullPath), `File ${pageRel} must exist`);

      const html = fs.readFileSync(fullPath, 'utf8');

      // 1. DOCTYPE
      assert.match(html, /<!doctype\s+html>/i, `${pageRel} must have DOCTYPE`);

      // 2. Viewport
      assert.match(html, /<meta[^>]*viewport/i, `${pageRel} must have viewport meta tag`);

      // 3. Title
      assert.match(html, /<title>[^<]+<\/title>/i, `${pageRel} must have title`);

      // 4. No hardcoded secret leakage
      assert.doesNotMatch(html, /sk-[a-zA-Z0-9]{20,}/, `${pageRel} must not leak API keys`);
      assert.doesNotMatch(html, /ghp_[a-zA-Z0-9]{20,}/, `${pageRel} must not leak GitHub tokens`);
    });
  }
});
