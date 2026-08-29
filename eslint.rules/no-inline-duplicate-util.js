/**
 * ESLint Custom Rule: no-inline-duplicate-util
 * Prevents inlining duplicate utilities that should come from shared helpers or component inventory.
 */
import fs from 'node:fs';
import path from 'node:path';

let inventory = null;
function getKnownUtilities() {
  if (inventory) return inventory;
  const inventoryPath = path.resolve(process.cwd(), 'data/component-inventory.json');
  if (fs.existsSync(inventoryPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
      inventory = new Set((data.knownUtilities || []).map((u) => u.name));
    } catch {
      inventory = new Set();
    }
  } else {
    inventory = new Set(['debounce', 'throttle', 'clamp', 'slugify', 'escapeHtml', 'formatCurrency']);
  }
  return inventory;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow local reinvention of shared utilities found in component inventory',
      category: 'Best Practices',
    },
    schema: [],
    messages: {
      duplicateUtil: "Utility function '{{name}}' duplicates a known shared helper. Import it from shared utilities instead.",
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename?.() || '';
    const filename = rawFilename.replace(/\\/g, '/');
    if (filename.includes('scripts/') || filename.includes('assets/js/utils/')) {
      return {};
    }

    const knownUtils = getKnownUtilities();

    return {
      FunctionDeclaration(node) {
        if (node.id && knownUtils.has(node.id.name)) {
          context.report({
            node: node.id,
            messageId: 'duplicateUtil',
            data: { name: node.id.name },
          });
        }
      },
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          knownUtils.has(node.id.name) &&
          node.init &&
          (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')
        ) {
          context.report({
            node: node.id,
            messageId: 'duplicateUtil',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};
