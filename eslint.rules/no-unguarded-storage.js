/**
 * ESLint Custom Rule: no-unguarded-storage
 * Requires web storage (localStorage / sessionStorage) calls in frontend code to be guarded by try-catch.
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require web storage operations to be wrapped in try/catch or defensive guards',
      category: 'Reliability',
    },
    schema: [],
    messages: {
      unguardedStorage: "Direct access to '{{storageType}}.{{method}}' must be enclosed in a try/catch block to prevent quota/privacy exceptions.",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('assets/js/')) {
      return {};
    }

    function isInsideTryCatch(node) {
      let current = node.parent;
      while (current) {
        if (current.type === 'TryStatement') return true;
        current = current.parent;
      }
      return false;
    }

    return {
      MemberExpression(node) {
        if (
          node.object &&
          node.object.type === 'Identifier' &&
          (node.object.name === 'localStorage' || node.object.name === 'sessionStorage') &&
          node.property &&
          node.property.type === 'Identifier' &&
          ['setItem', 'getItem', 'removeItem', 'clear'].includes(node.property.name)
        ) {
          if (!isInsideTryCatch(node)) {
            context.report({
              node,
              messageId: 'unguardedStorage',
              data: {
                storageType: node.object.name,
                method: node.property.name,
              },
            });
          }
        }
      },
    };
  },
};
