const path = require('path')

module.exports = {
  entry: path.join(__dirname, './src/index.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js',
    // Ensure that the resulting bundle can be used everywhere by using the Universal Module
    // Definition
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: [/node_modules/] },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: [/node_modules/] },
      { test: /\.png$/, loader: 'file-loader' },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
}
