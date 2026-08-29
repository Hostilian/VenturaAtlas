/**
 * ESLint Custom Rule: require-task-id-on-todo
 * Requires all TODO, FIXME, and XXX comments to reference a valid task ID: // TODO(TASK-001): description
 */
const TODO_REGEX = /\b(TODO|FIXME|XXX)\b(?!\s*\([A-Za-z0-9_#-]+\))/i;
const TASK_REF_REGEX = /\b(TODO|FIXME|XXX)\s*\(([A-Za-z0-9_#-]+)\)/i;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce TODO/FIXME comments to reference an authoritative backlog task ID',
      category: 'Project Invariants',
    },
    schema: [],
    messages: {
      missingTaskId: "Comment '{{tag}}' must reference an authoritative task ID in format: {{tag}}(TASK-ID): explanation",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const comments = sourceCode.getAllComments ? sourceCode.getAllComments() : [];

    for (const comment of comments) {
      const text = comment.value;
      if (TODO_REGEX.test(text) && !TASK_REF_REGEX.test(text)) {
        const match = text.match(/\b(TODO|FIXME|XXX)\b/i);
        const tag = match ? match[1].toUpperCase() : 'TODO';
        context.report({
          loc: comment.loc,
          messageId: 'missingTaskId',
          data: { tag },
        });
      }
    }

    return {};
  },
};
