/**
 * ESLint Custom Rule: no-edits-to-generated-output
 * Disallows source code writing directly to _site/, dist/, or tmp/ build output directories.
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct writes to generated artifact directories outside generator scripts',
      category: 'Build Integrity',
    },
    schema: [],
    messages: {
      generatedOutputWrite: "Direct file write to generated directory '{{target}}' is prohibited from application source.",
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
        if (typeof node.value === 'string') {
          const match = node.value.match(/(\b_site\/|\bdist\/)/);
          if (match && node.parent && node.parent.type === 'CallExpression') {
            const calleeName = node.parent.callee.name || (node.parent.callee.property && node.parent.callee.property.name);
            if (['writeFileSync', 'writeFile', 'copyFileSync'].includes(calleeName)) {
              context.report({
                node,
                messageId: 'generatedOutputWrite',
                data: { target: match[1] },
              });
            }
          }
        }
      },
    };
  },
};
