/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jquery: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:cypress/recommended',
    'plugin:mocha/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'mocha/no-mocha-arrows': 0,
    'mocha/no-setup-in-describe': 0,
    'mocha/no-exclusive-tests': 'error',
  },
};
