/**
 * ESLint Custom Rule: no-new-network-call-without-doc
 * Enforces that network requests (fetch, XMLHttpRequest, WebSocket) reference documented endpoints/services.
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require frontend network requests to cite a documented source or service',
      category: 'Architecture',
    },
    schema: [],
    messages: {
      undocumentedNetwork: "Direct call to '{{callee}}' in frontend code should be encapsulated in a documented service adapter or include documentation comments.",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('assets/js/')) {
      return {};
    }

    return {
      CallExpression(node) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
          // Check if parent or preceding comments mention documentation
          const sourceCode = context.sourceCode || context.getSourceCode();
          const comments = sourceCode.getCommentsBefore ? sourceCode.getCommentsBefore(node) : [];
          const hasDocComment = comments.some((c) => /@service|@doc|@api|adapter/i.test(c.value));
          if (!hasDocComment && !filename.includes('adapter') && !filename.includes('services/')) {
            context.report({
              node,
              messageId: 'undocumentedNetwork',
              data: { callee: 'fetch' },
            });
          }
        }
      },
      NewExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'XMLHttpRequest' || node.callee.name === 'WebSocket')
        ) {
          if (!filename.includes('adapter') && !filename.includes('services/')) {
            context.report({
              node,
              messageId: 'undocumentedNetwork',
              data: { callee: node.callee.name },
            });
          }
        }
      },
    };
  },
};
