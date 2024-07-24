const path = require('path');
module.exports = {
  stories: ['../js/**/*.mdx', '../js/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '@storybook/addon-webpack5-compiler-babel'
  ],
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
    };

    config.resolve.roots = [path.resolve(__dirname, '../../priv/static')];

    return config;
  },
  docs: {},
  staticDirs: ['../../priv/static'],
};
