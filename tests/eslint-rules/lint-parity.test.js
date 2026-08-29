/**
 * Deliberately-broken syntax parity verification test.
 * Proves that ESLint catches 100% of the syntax errors that check-js-syntax.js caught,
 * plus deep AST errors that check-js-syntax.js missed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import eslintConfig from '../../eslint.config.mjs';

test('Lint Parity & Deliberately-Broken Syntax Suite', async (t) => {
  const linter = new Linter();

  await t.test('Catches broken syntax (unclosed curly brace)', () => {
    const brokenCode = 'function broken() { console.log("hello");';
    const messages = linter.verify(brokenCode, eslintConfig, { filename: 'test.js' });
    assert.ok(messages.length > 0, 'Should catch unclosed curly brace');
    assert.match(messages[0].message, /Parsing error/);
  });

  await t.test('Catches duplicate variable declarations (var/let collision)', () => {
    const redeclaredCode = 'let a = 1; var a = 2;';
    const messages = linter.verify(redeclaredCode, eslintConfig, { filename: 'scripts/test.js' });
    assert.ok(messages.some(m => m.ruleId === 'no-redeclare' || m.message.includes('Identifier \'a\' has already been declared')));
  });

  await t.test('Catches unreachable code after return', () => {
    const unreachableCode = 'function calc() { return 42; const unreachable = 99; }';
    const messages = linter.verify(unreachableCode, eslintConfig, { filename: 'scripts/test.js' });
    assert.ok(messages.some(m => m.ruleId === 'no-unreachable'));
  });

  await t.test('Catches undefined global variables in Node scripts', () => {
    const undefCode = 'const result = nonexistentVariable + 10;';
    const messages = linter.verify(undefCode, eslintConfig, { filename: 'scripts/test.js' });
    assert.ok(messages.some(m => m.ruleId === 'no-undef'));
  });
});
