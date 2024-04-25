const path = require('path');

const resolvePath = (p) => path.resolve(__dirname, p);

module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true,
    node: true,
    'jest/globals': true,
  },
  globals: {
    process: true,
  },
  extends: [
    'plugin:import/recommended',
    'plugin:react/recommended',
    'airbnb',
    'prettier',
    'plugin:storybook/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx'],
        map: [
          ['@common', resolvePath('./js/common')],
          ['@hooks', resolvePath('./js/hooks')],
          ['@lib', resolvePath('./js/lib')],
          ['@pages', resolvePath('./js/pages')],
          ['@state', resolvePath('./js/state')],
          ['@static', resolvePath('./static')],
        ],
      },
    },
  },
  plugins: ['react', 'jest'],
  rules: {
    'no-console': 'error',
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    ],
    'react/prop-types': 'off',
    camelcase: 'off',
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
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
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/label-has-associated-control.md#case-my-label-and-input-components-are-custom-components
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        controlComponents: ['Input', 'Password', 'TextArea'],
        depth: 3,
      },
    ],
  },
};
