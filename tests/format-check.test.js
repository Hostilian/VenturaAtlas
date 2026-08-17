const test = require('node:test');
const assert = require('node:assert/strict');

const { inspectBuffer, normalizeBuffer } = require('../scripts/check-format');

test('format checker accepts consistent UTF-8 LF or CRLF source', () => {
  assert.deepEqual(inspectBuffer(Buffer.from('const a = 1;\nconst b = 2;\n')), []);
  assert.deepEqual(inspectBuffer(Buffer.from('const a = 1;\r\nconst b = 2;\r\n')), []);
});

test('format checker rejects and repairs mixed line endings and UTF-8 BOM', () => {
  const mixed = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('a\r\nb\nc\r')]);
  assert.deepEqual(inspectBuffer(mixed), ['contains UTF-8 BOM', 'uses mixed or legacy line endings']);
  assert.deepEqual(inspectBuffer(normalizeBuffer(mixed)), []);
});

test('format checker fails closed on NUL bytes', () => {
  assert.ok(inspectBuffer(Buffer.from([0x61, 0x00, 0x62])).includes('contains NUL byte'));
});
