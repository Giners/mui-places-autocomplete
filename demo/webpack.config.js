const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, './index.jsx'),
  output: {
    path: path.join(__dirname, './lib'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: [/node_modules/] },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: [/node_modules/] },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  // The 'HTMLWebpackPlugin' simplifies the creation of HTML files to serve our webpack bundle by
  // generating it for us. The webpack dev server then uses this generated HTML to serve our
  // content.
  plugins: [new HTMLWebpackPlugin({
    // Use the template 'demo/index.html' as it embeds some fonts as required by Material-UI. For
    // more details see: https://material-ui-next.com/getting-started/installation/
    template: path.join(__dirname, './index.html'),
  })],
}
