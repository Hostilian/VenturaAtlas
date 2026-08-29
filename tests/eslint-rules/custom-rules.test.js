/**
 * Unit tests for custom ESLint rules (ESLint 9 Flat Config compatible)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';

import noInlineDuplicateUtil from '../../eslint.rules/no-inline-duplicate-util.js';
import requireTaskIdOnTodo from '../../eslint.rules/require-task-id-on-todo.js';
import noHardcodedSecrets from '../../eslint.rules/no-hardcoded-secrets.js';
import noUnguardedStorage from '../../eslint.rules/no-unguarded-storage.js';
import noNewNetworkCallWithoutDoc from '../../eslint.rules/no-new-network-call-without-doc.js';
import preferCanonicalDataWrite from '../../eslint.rules/prefer-canonical-data-write.js';
import noEditsToGeneratedOutput from '../../eslint.rules/no-edits-to-generated-output.js';

function verifyWithRule(code, ruleName, ruleDef, filename = 'test.js') {
  const linter = new Linter();
  const config = [
    {
      plugins: {
        custom: {
          rules: {
            [ruleName]: ruleDef,
          },
        },
      },
      rules: {
        [`custom/${ruleName}`]: 'error',
      },
    },
  ];
  return linter.verify(code, config, { filename });
}

test('ESLint Custom Rules Suite', async (t) => {
  await t.test('require-task-id-on-todo: rejects unlinked TODO and accepts linked TODO', () => {
    const badCode = '// ' + 'TODO' + ': clean up this function\nfunction test() {}';
    const badMessages = verifyWithRule(badCode, 'require-task-id-on-todo', requireTaskIdOnTodo);
    assert.equal(badMessages.length, 1);
    assert.match(badMessages[0].message, /must reference an authoritative task ID/);

    const goodCode = '// TODO(TASK-001): clean up this function\nfunction test() {}';
    const goodMessages = verifyWithRule(goodCode, 'require-task-id-on-todo', requireTaskIdOnTodo);
    assert.equal(goodMessages.length, 0);
  });

  await t.test('no-hardcoded-secrets: detects literal API keys and tokens', () => {
    const badCode = 'const key = "sk-123456789012345678901234567890";';
    const messages = verifyWithRule(badCode, 'no-hardcoded-secrets', noHardcodedSecrets);
    assert.equal(messages.length, 1);
    assert.match(messages[0].message, /secret or token/);

    const goodCode = 'const key = process.env.OPENROUTER_API_KEY;';
    const goodMessages = verifyWithRule(goodCode, 'no-hardcoded-secrets', noHardcodedSecrets);
    assert.equal(goodMessages.length, 0);
  });

  await t.test('no-unguarded-storage: flags direct localStorage access in frontend code', () => {
    const badCode = 'localStorage.setItem("user", "val");';
    const messages = verifyWithRule(
      badCode,
      'no-unguarded-storage',
      noUnguardedStorage,
      'assets/js/app.js'
    );
    assert.equal(messages.length, 1);
    assert.match(messages[0].message, /try\/catch/);

    const goodCode = 'try { localStorage.setItem("user", "val"); } catch (e) {}';
    const goodMessages = verifyWithRule(
      goodCode,
      'no-unguarded-storage',
      noUnguardedStorage,
      'assets/js/app.js'
    );
    assert.equal(goodMessages.length, 0);
  });

  await t.test('no-inline-duplicate-util: flags local redeclaration of known utils', () => {
    const badCode = 'function debounce(fn, delay) { return fn; }';
    const messages = verifyWithRule(
      badCode,
      'no-inline-duplicate-util',
      noInlineDuplicateUtil,
      'assets/js/feature.js'
    );
    assert.equal(messages.length, 1);
    assert.match(messages[0].message, /duplicates a known shared helper/);
  });

  await t.test('prefer-canonical-data-write: flags direct writes to data/ideas.json from app code', () => {
    const badCode = 'fs.writeFileSync("data/ideas.json", JSON.stringify(data));';
    const messages = verifyWithRule(
      badCode,
      'prefer-canonical-data-write',
      preferCanonicalDataWrite,
      'assets/js/mutate.js'
    );
    assert.equal(messages.length, 1);
  });

  await t.test('no-edits-to-generated-output: flags file operations writing to _site/ from source code', () => {
    const badCode = 'fs.writeFileSync("_site/index.html", html);';
    const messages = verifyWithRule(
      badCode,
      'no-edits-to-generated-output',
      noEditsToGeneratedOutput,
      'assets/js/page.js'
    );
    assert.equal(messages.length, 1);
  });
});
