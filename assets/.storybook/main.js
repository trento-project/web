// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
module.exports = {
  stories: ['../js/**/*.mdx', '../js/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-webpack5-compiler-babel', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@common': path.resolve(__dirname, '../js/common'),
      '@hooks': path.resolve(__dirname, '../js/hooks'),
      '@lib': path.resolve(__dirname, '../js/lib'),
      '@pages': path.resolve(__dirname, '../js/pages'),
      '@state': path.resolve(__dirname, '../js/state'),
      '@static': path.resolve(__dirname, '../static'),
      // phoenix is loaded transitively via SocketProvider/AssistantChatProvider
      // when AIAssistant components are rendered in stories — alias to the
      // same mock Jest uses so Storybook can build.
      phoenix: path.resolve(__dirname, '../mocks/phoenix.js'),
    };

    config.resolve.roots = [path.resolve(__dirname, '../../priv/static')];

    return config;
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ['../../priv/static'],
};
