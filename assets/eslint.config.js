// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
// import { importX } from 'eslint-plugin-import-x';
import storybookPlugin from 'eslint-plugin-storybook';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';
import path from 'path';

const resolvePath = (p) => path.resolve(path.resolve(path.dirname('')), p);

export default defineConfig([
  globalIgnores([
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '.storybook/public/**',
      '../priv/static/**',
  ]),

  // First config object is global for all JS files.
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      }
    },
    plugins: {
      js,
      import: importPlugin,
    },
    extends: ['js/recommended'],
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          paths: [resolvePath('./js'), resolvePath('./')],
          moduleDirectory: ['node_modules', './'],
        },
      },
    },
    rules: {
      // Disable import/no-unresolved since alias paths won't resolve properly with node resolver
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '^@common',
            '^@hooks',
            '^@lib',
            '^@pages',
            '^@state',
            '^@static',
          ],
        },
      ],
      'import/named': 'error',
      'import/default': 'error',
      'import/no-cycle': 'off',
      'import/prefer-default-export': 'off',
      'no-console': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^.',
          varsIgnorePattern: '^(React|_)',
          ignoreRestSiblings: true,
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'all',
        },
      ],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      camelcase: 'off',
      'no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: true },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': 'error',
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'error',
    },
  },

  {
    files: ['**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    extends: [
      // 'react/recommended',
      // 'react/jsx-runtime',
      // 'jsx-a11y/recommended',
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.jsx', '.js'] },
      ],
      'react/function-component-definition': 'error',
      'react/react-in-jsx-scope': 'off',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Input', 'Password', 'TextArea'],
          depth: 3,
        },
      ],
    },
  },

  // Specific settings for test files
  {
    files: [
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/setupTests.js',
      '**/test-utils/**/*.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    extends: ['jest/recommended'],
    rules: {
      'jest/no-conditional-expect': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true, // Allow all devDependencies
        },
      ],
    },
  },

  // Allow devDependencies for development files
  {
    files: [
      '*.js',
      '*.config.js',
      '*.config.cjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true, // Allow all devDependencies
        },
      ],
    },
  },

  // storybook files
  {
    files: ['**/*.stories.{js,jsx}', '**/.storybook/**/*.{js,jsx}'],
    plugins: {
      storybook: storybookPlugin,
    },
    extends: ['storybook/recommended'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            'storybook/*',
            '@lib/*',
            '@common/*',
            '@static/*',
            '@state/*',
            '@pages/*',
            '@hooks/*',
            // FIXME: Assets are not generated before linting, so these paths don't resolve
            '../../priv/static/assets/*',
          ],
        },
      ],
    },
  },

  prettierConfig,
]);
