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
          ['@components', resolvePath('./js/components')],
          ['@state', resolvePath('./js/state')],
          ['@lib', resolvePath('./js/lib')],
          ['@hooks', resolvePath('./js/hooks')],
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
        ],
      },
    ],
  },
};
