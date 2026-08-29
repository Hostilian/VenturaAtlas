/**
 * ESLint Custom Rule: no-hardcoded-secrets
 * Disallows hardcoded API keys, JWT tokens, DSN strings, and private credentials in source files.
 */
const SECRET_LITERAL_REGEX = /(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|Bearer\s+[a-zA-Z0-9._-]{25,}|https:\/\/[a-f0-9]{32}@o[0-9]+\.ingest\.sentry\.io\/[0-9]+)/i;
const SENSITIVE_VAR_NAMES = new Set(['apikey', 'secretkey', 'auth_token', 'private_key', 'sentry_dsn', 'sentry_auth_token']);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded secrets, API tokens, and credentials in source code',
      category: 'Security',
    },
    schema: [],
    messages: {
      hardcodedSecret: 'Possible hardcoded secret or token detected. Read credentials from environment variables instead.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && SECRET_LITERAL_REGEX.test(node.value)) {
          context.report({
            node,
            messageId: 'hardcodedSecret',
          });
        }
      },
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          SENSITIVE_VAR_NAMES.has(node.id.name.toLowerCase()) &&
          node.init &&
          node.init.type === 'Literal' &&
          typeof node.init.value === 'string' &&
          node.init.value.length > 8 &&
          !node.init.value.startsWith('process.env')
        ) {
          context.report({
            node: node.init,
            messageId: 'hardcodedSecret',
          });
        }
      },
    };
  },
};
