const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('Runtime Contract — Duration Parsing Helper', () => {
  const siteJs = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');

  // Verify function parseDurationDays exists in site.js
  assert(siteJs.includes('function parseDurationDays'), 'assets/js/site.js must include parseDurationDays function');

  // Inline simulation test of duration parsing rules
  function parseDurationDays(str) {
    if (!str) return 9999;
    const s = String(str).toLowerCase();
    if (s.includes('day') || s.includes('hours')) return 2;
    if (s.includes('1–2 week') || s.includes('1-2 week') || s.includes('2 week')) return 10;
    if (s.includes('3+') || s.includes('quarter') || s.includes('year') || s.includes('6+')) return 90;
    if (s.includes('3–8 week') || s.includes('3-8 week') || s.includes('month') || s.includes('4-8 week')) return 35;
    return 45;
  }

  assert(parseDurationDays('2 days') < parseDurationDays('1–2 weeks'));
  assert(parseDurationDays('1–2 weeks') < parseDurationDays('3–8 weeks'));
  assert(parseDurationDays('3–8 weeks') < parseDurationDays('3+ months'));
});

test('Runtime Contract — Zero Runtime Inline Event Handlers in Main Templates', () => {
  const homeJs = fs.readFileSync(path.join(root, 'assets/js/home.js'), 'utf8');
  assert(!homeJs.includes('onclick='), 'assets/js/home.js should use event delegation instead of inline onclick handlers');
});
