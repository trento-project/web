// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */

const path = require('path');
const alias = require('esbuild-plugin-path-alias');
const esbuild = require('esbuild');

const resolvePath = (p) => path.resolve(__dirname, p);

const watching = Boolean(process.env.ESBUILD_WATCH);

const buildConfig = {
  entryPoints: ['js/app.js', 'js/trento.jsx'],
  outdir: resolvePath('../priv/static/assets'),
  bundle: true,
  // Code splitting turns every `import()` into a chunk fetched on demand
  // instead of being inlined into the entry. mermaid is the reason: it is
  // half the bundle and only the AI assistant ever renders a diagram.
  // Splitting is ESM-only, so both entries load as `<script type="module">` —
  // see `root.html.heex` and `page_html/index.html.heex`.
  splitting: true,
  format: 'esm',
  // Chunk names carry a content hash, so they cache-bust themselves. Only the
  // two stable entry names need `mix phx.digest`.
  chunkNames: 'chunk-[hash]',
  minify: !process.env.ESBUILD_WATCH,
  sourcemap: process.env.ESBUILD_WATCH ? 'inline' : false,
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl',
  },
  plugins: [
    alias({
      phoenix: resolvePath('../deps/phoenix/priv/static/phoenix.mjs'),
      phoenix_html: resolvePath(
        '../deps/phoenix_html/priv/static/phoenix_html.js'
      ),
      phoenix_live_view: resolvePath(
        '../deps/phoenix_live_view/priv/static/phoenix_live_view.esm.js'
      ),
      '@common': resolvePath('./js/common'),
      '@hooks': resolvePath('./js/hooks'),
      '@lib': resolvePath('./js/lib'),
      '@pages': resolvePath('./js/pages'),
      '@state': resolvePath('./js/state'),
      '@static': resolvePath('./static'),
    }),
  ],
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
