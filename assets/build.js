// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

import path from 'path';
import esbuild from 'esbuild';

const resolvePath = (p) => path.resolve(import.meta.dirname, p);

const watching = Boolean(process.env.ESBUILD_WATCH);

const buildConfig = {
  entryPoints: ['js/app.js', 'js/trento.jsx'],
  outdir: resolvePath('../priv/static/assets'),
  bundle: true,
  minify: !process.env.ESBUILD_WATCH,
  sourcemap: process.env.ESBUILD_WATCH ? 'inline' : false,
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
  },
};

const build = async () => {
  if (watching) {
    const context = await esbuild.context(buildConfig);
    console.log('=> JS bundle was built!');
    console.log('=> Watching...');

    context.watch();
  } else {
    await esbuild.build(buildConfig);
    console.log('=> JS bundle was built!');
  }
};

build();
