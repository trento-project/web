/* eslint-disable no-undef */
/* eslint-disable no-console */
const path = require('path');
const alias = require('esbuild-plugin-path-alias');

const resolvePath = (p) => path.resolve(__dirname, p);

require('esbuild')
  .build({
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
        phoenix: resolvePath('../deps/phoenix/priv/static/phoenix.esm.js'),
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
      }),
    ],
  })
  .then((_result) => {
    console.log('Built!');
  })
  .catch((err) => console.log(err));
