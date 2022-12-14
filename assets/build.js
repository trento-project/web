/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const alias = require('esbuild-plugin-path-alias');
const { config } = require('dotenv');

config();

const resolvePath = (p) => path.resolve(__dirname, p);

const stringify = (variable) => {
  if (!variable) {
    return JSON.stringify('');
  }
  return JSON.stringify(variable);
};

const WANDA_URL =
  process.env.NODE_ENV === 'production' ? '' : stringify(process.env.WANDA_URL);

const define = {
  'process.env.WANDA_URL': WANDA_URL,
};

require('esbuild')
  .build({
    define,
    entryPoints: ['js/app.js', 'js/trento.jsx'],
    outdir: resolvePath('../priv/static/assets'),
    bundle: true,
    minify: !process.env.ESBUILD_WATCH,
    sourcemap: process.env.ESBUILD_WATCH ? 'inline' : false,
    loader: {
      '.png': 'dataurl',
      '.svg': 'dataurl',
    },
    watch: Boolean(process.env.ESBUILD_WATCH),
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
  })
  .then((_result) => {
    console.log('Built!');
  })
  .catch((err) => console.log(err));
