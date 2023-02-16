/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const alias = require('esbuild-plugin-path-alias');
const esbuild = require('esbuild');
const { config } = require('dotenv');

config();

const resolvePath = (p) => path.resolve(__dirname, p);

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
  plugins: [
    alias({
      phoenix: resolvePath('../deps/phoenix/priv/static/phoenix.mjs'),
      phoenix_html: resolvePath(
        '../deps/phoenix_html/priv/static/phoenix_html.js'
      ),
      phoenix_live_view: resolvePath(
        '../deps/phoenix_live_view/priv/static/phoenix_live_view.esm.js'
      ),
      '@components': resolvePath('./js/components'),
      '@state': resolvePath('./js/state'),
      '@lib': resolvePath('./js/lib'),
      '@hooks': resolvePath('./js/hooks'),
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
