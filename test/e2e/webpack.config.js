var path = require('path');
var webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../assets/js/lib'),
    },
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /\.(png|jpe?g|gif|svg|ico)$/,
      path.resolve(__dirname, '../../assets/mocks/fileMock.js')
    ),
  ],
};
