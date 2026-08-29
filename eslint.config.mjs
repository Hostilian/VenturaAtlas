import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import noInlineDuplicateUtil from "./eslint.rules/no-inline-duplicate-util.js";
import requireTaskIdOnTodo from "./eslint.rules/require-task-id-on-todo.js";
import noHardcodedSecrets from "./eslint.rules/no-hardcoded-secrets.js";
import noUnguardedStorage from "./eslint.rules/no-unguarded-storage.js";
import noNewNetworkCallWithoutDoc from "./eslint.rules/no-new-network-call-without-doc.js";
import preferCanonicalDataWrite from "./eslint.rules/prefer-canonical-data-write.js";
import noEditsToGeneratedOutput from "./eslint.rules/no-edits-to-generated-output.js";

const customPlugin = {
  rules: {
    "no-inline-duplicate-util": noInlineDuplicateUtil,
    "require-task-id-on-todo": requireTaskIdOnTodo,
    "no-hardcoded-secrets": noHardcodedSecrets,
    "no-unguarded-storage": noUnguardedStorage,
    "no-new-network-call-without-doc": noNewNetworkCallWithoutDoc,
    "prefer-canonical-data-write": preferCanonicalDataWrite,
    "no-edits-to-generated-output": noEditsToGeneratedOutput,
  },
};

const commonRules = {
  "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
  "no-console": "off",
  "no-redeclare": "error",
  "no-unreachable": "error",
  "no-control-regex": "off",
  "no-useless-escape": "warn",
  "no-empty": ["warn", { "allowEmptyCatch": true }],
  "no-constant-binary-expression": "warn",
  "no-constant-condition": ["warn", { "checkLoops": false }],
  "custom/no-inline-duplicate-util": "warn",
  "custom/require-task-id-on-todo": "warn",
  "custom/no-hardcoded-secrets": "error",
  "custom/no-unguarded-storage": "warn",
  "custom/no-new-network-call-without-doc": "warn",
  "custom/prefer-canonical-data-write": "error",
  "custom/no-edits-to-generated-output": "error",
};

export default [
  js.configs.recommended,
  // Node files (scripts, tests, services, configs)
  {
    files: ["scripts/**/*.js", "services/**/*.js", "tests/**/*.js", "*.mjs", "*.js"],
    plugins: { custom: customPlugin },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.nodeBuiltin,
        ...globals.es2021,
      },
    },
    rules: {
      ...commonRules,
      "no-undef": "error",
    },
  },
  // TypeScript files (FactBounty API & Playwright e2e tests)
  {
    files: ["apps/**/*.ts", "tests/**/*.ts", "**/*.ts"],
    plugins: {
      custom: customPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.nodeBuiltin,
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      ...commonRules,
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    },
  },
  // Browser frontend files (assets/js)
  {
    files: ["assets/js/**/*.js"],
    plugins: { custom: customPlugin },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      ...commonRules,
      "no-undef": "warn",
    },
  },
  // ESLint test rules exemption for fake secret test vectors
  {
    files: ["tests/**/*.js", "tests/**/*.ts"],
    rules: {
      "custom/no-hardcoded-secrets": "off",
    },
  },
  {
    ignores: [
      "_site/**",
      "node_modules/**",
      ".agent-state/**",
      "dist/**",
      "tmp/**",
      "coverage/**",
      "archive/**",
      "ideas/**",
      "prompts/**",
      "financial-models/**",
      "launch-plans/**",
      "validation-plans/**",
      "technical-blueprints/**",
      "docs/**",
      "categories/**",
      "rankings/**",
      "data/**",
    ],
  },
];

