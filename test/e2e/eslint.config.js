// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import js from '@eslint/js';
import cypress from 'eslint-plugin-cypress';
import mocha from 'eslint-plugin-mocha';
import globals from 'globals';

export default [
  js.configs.recommended,
  cypress.configs.recommended,
  mocha.configs.recommended,
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
      'mocha/no-exclusive-tests': 'error',
      'cypress/unsafe-to-chain-command': 'off',
      'mocha/consistent-spacing-between-blocks': 'off',
      'mocha/no-async-in-sync-tests': 'off',
      'mocha/no-conditional-tests': 'off',
      'mocha/no-pending-tests': ['error', { allowSkippedWithComment: true }],
    },
  },
];
