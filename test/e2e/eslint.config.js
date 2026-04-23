const js = require('@eslint/js');
const cypress = require('eslint-plugin-cypress');
const mocha = require('eslint-plugin-mocha');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  cypress.configs.recommended,
  mocha.default.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jquery,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      'mocha/no-mocha-arrows': 0,
      'mocha/no-setup-in-describe': 0,
      'mocha/no-exclusive-tests': 'error',
      'cypress/unsafe-to-chain-command': 'off',
      'mocha/consistent-spacing-between-blocks': 'off',
      'mocha/no-pending-tests': 'error',
    },
  },
];
