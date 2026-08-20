// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { mergeConfig } from 'vite';

export default {
  stories: ['../js/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Vite has problems converting `redux-mock-store` to ESM,
          // this creates an alias that would directly map to the
          // correct package entrypoint.
          'redux-mock-store': 'redux-mock-store/dist/index-es.js',
        },
      },
    });
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ['../../priv/static'],
};
