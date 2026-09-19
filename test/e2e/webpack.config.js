// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import webpack from 'webpack';

export default {
  resolve: {
    alias: {
      '@lib': path.resolve(import.meta.dirname, '../../assets/js/lib'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /\.(png|jpe?g|gif|svg|ico)$/,
      path.resolve(import.meta.dirname, '../../assets/mocks/fileMock.js')
    ),
  ],
};
