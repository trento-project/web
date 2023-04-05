const path = require('path');
module.exports = {
  stories: ['../js/**/*.stories.mdx', '../js/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, '../js/components'),
      '@lib': path.resolve(__dirname, '../js/lib'),
      '@hooks': path.resolve(__dirname, '../js/hooks'),
      '@state': path.resolve(__dirname, '../js/state'),
      '@static': path.resolve(__dirname, '../static'),
    };
    return config;
  },
  docs: {
    autodocs: true,
  },
};
