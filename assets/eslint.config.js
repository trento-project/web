// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import storybookPlugin from 'eslint-plugin-storybook';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';

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
      'import-x': importX,
    },
    extends: ['js/recommended', 'import-x/flat/recommended'],
    settings: {
      'import-x/resolver-next': [
        // We're using a TypeScript resolver because it has support
        // for `jsconfig.json`.
        createTypeScriptImportResolver({ extensions: ['.js', '.jsx'] }),
      ],
    },
    rules: {
      // Disable import/no-unresolved since alias paths won't resolve properly with node resolver
      'import-x/named': 'error',
      'import-x/default': 'error',
      'import-x/no-cycle': 'off',
      'import-x/prefer-default-export': 'off',
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
      'jsx-a11y-x': jsxA11yX,
    },
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      'jsx-a11y-x/recommended',
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
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

      'jsx-a11y-x/label-has-associated-control': [
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
      'import-x/no-extraneous-dependencies': [
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
      'import-x/no-extraneous-dependencies': [
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
      'import-x/no-unresolved': [
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
