const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const jestPlugin = require('eslint-plugin-jest');
const storybookPlugin = require('eslint-plugin-storybook');
const prettierConfig = require('eslint-config-prettier');
const path = require('path');

const resolvePath = (p) => path.resolve(path.resolve(path.dirname('')), p);

module.exports = [
{
  ignores: [
    '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.storybook/public/**',
      '../priv/static/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: true,
        console: true,
        window: true,
        document: true,
        navigator: true,
        fetch: true,
        localStorage: true,
        sessionStorage: true,
        alert: true,
        confirm: true,
        prompt: true,
        setTimeout: true,
        setInterval: true,
        clearTimeout: true,
        clearInterval: true,
        $: false,
        jQuery: false,
        // Jest globals
        describe: true,
        test: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        jest: true,
        // browser globals
        crypto: true,
        URL: true,
        URLSearchParams: true,
        File: true,
        Blob: true,
        FormData: true,
        Headers: true,
        Request: true,
        Response: true,
        SVGElement: true,
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      jest: jestPlugin,
      storybook: storybookPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          paths: [resolvePath('./js'), resolvePath('./')],
          moduleDirectory: ['node_modules', './'],
        },
      },
    },

    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
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

      ...jsxA11yPlugin.configs.recommended.rules,
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Input', 'Password', 'TextArea'],
          depth: 3,
        },
      ],

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
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.stories.*',
            '**/.storybook/**/*',
            '**/*{.,_}{test,spec}.{js,jsx}',
            '**/test-utils/factories/*',
          ],
        },
      ],

      ...jestPlugin.configs.recommended.rules,
      ...storybookPlugin.configs.recommended.rules,

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

  // Specific settings for test files
  {
    files: [
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/setupTests.js',
      '**/__tests__/**/*.{js,jsx}',
      '**/test-utils/**/*.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        global: true,
        require: true,
        __dirname: true,
      },
    },
    rules: {
      'jest/no-conditional-expect': 'off',
    },
  },

  // Allow devDependencies for development files
  {
    files: [
      '*.js',
      '**/test-utils/**/*.{js,jsx}',
      '**/*.stories.{js,jsx}',
      '**/.storybook/**/*.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        module: true,
        require: true,
        __dirname: true,
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
    languageOptions: {
      globals: {
        __dirname: true,
      },
    },
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
];
