/**
 * ESLint Custom Rule: prefer-canonical-data-write
 * Flags direct mutation of data/ideas.json outside scripts/ authorized publisher paths.
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct writes to data/ideas.json outside authorized publishers',
      category: 'Data Integrity',
    },
    schema: [],
    messages: {
      unauthorizedDataWrite: 'Direct write to data/ideas.json is restricted to authorized publisher scripts.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename?.() || '';
    const filename = rawFilename.replace(/\\/g, '/');
    if (filename.includes('scripts/') || filename.includes('tests/')) {
      return {};
    }

    return {
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          (node.value.includes('data/ideas.json') || node.value.endsWith('ideas.json')) &&
          node.parent &&
          node.parent.type === 'CallExpression' &&
          node.parent.callee &&
          (node.parent.callee.name === 'writeFileSync' ||
            (node.parent.callee.property && node.parent.callee.property.name === 'writeFileSync'))
        ) {
          context.report({
            node,
            messageId: 'unauthorizedDataWrite',
          });
        }
      },
    };
  },
};
