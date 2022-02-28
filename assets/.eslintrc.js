/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-console': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
  },
  ignorePatterns: ['assets/js/**'],
};
