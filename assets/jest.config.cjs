// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  clearMocks: true,
  globals: {
    config: {
      checksServiceBaseUrl: '',
      adminUsername: 'admin',
      ssoEnabled: false,
      ssoLoginUrl: 'http://localhost:4000/auth/oidc_callback',
      ssoCallbackUrl: '/auth/oidc_callback',
      ssoEnrollmentUrl: '/api/session/oidc_local/callback',
      aTestVariable: 123,
      aiEnabled: true,
      aiProviders: {
        googleai: [
          'gemini-2.5-pro',
          'gemini-2.5-flash',
          'gemini-2.5-flash-lite',
          'gemini-3.1-flash-preview',
          'gemini-3.1-flash-lite-preview',
          'gemini-3.1-pro-preview',
        ],
        openai: ['o3-mini', 'o3', 'gpt-4.1', 'gpt-4', 'gpt-5-mini', 'gpt-5.4'],
        anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
      },
    },
  },
  maxWorkers: '25%',
  moduleNameMapper: {
    '^@common(.*)$': '<rootDir>/js/common$1',
    '^@hooks(.*)$': '<rootDir>/js/hooks$1',
    '^@lib(.*)$': '<rootDir>/js/lib$1',
    '^@pages(.*)$': '<rootDir>/js/pages$1',
    '^@state(.*)$': '<rootDir>/js/state$1',
    '^phoenix$': '<rootDir>/mocks/phoenix.js',
    '^react-markdown$': '<rootDir>/mocks/reactMarkdown.jsx',
    '^remark-gfm$': '<rootDir>/mocks/remarkPlugin.js',
    '\\.(jpg|ico|jpeg|png|gif|svg)$': '<rootDir>/mocks/fileMock.js',
    '\\.css$': '<rootDir>/mocks/fileMock.js',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        addFileAttribute: 'true',
        ancestorSeparator: ' › ',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}', // outputname
        includeConsoleOutput: true,
        outputDirectory: '/tmp',
      },
    ],
  ],
  setupFilesAfterEnv: ['./setupTests.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-react'],
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@faker-js/faker|@assistant-ui|@ag-ui|assistant-stream|assistant-cloud|safe-content-frame|nanoid|zustand|use-sync-external-store' +
      '|react-syntax-highlighter|refractor|hastscript|hast-util-parse-selector|property-information' +
      '|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|parse-entities' +
      '|character-entities|character-entities-legacy|character-reference-invalid' +
      '|is-alphabetical|is-alphanumerical|is-decimal|is-hexadecimal)/)',
  ],
};
