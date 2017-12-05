const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: path.join(__dirname, './src/index.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js',
    // Ensure that the resulting bundle can be used everywhere by using the Universal Module
    // Definition
    libraryTarget: 'umd',
  },
  // 'externals' provides us a way of excluding dependencies from the output of the bundle. In this
  // case we use 'webpack-node-externals' to build/exclude all dependencies as found in
  // 'node_modules' and then we whitelist our few 'dependencies' found in 'package.json'. This way
  // we don't bundle up 'material-ui' and 'react' causing module duplication (which causes things
  // to break) while still allowing our component to be consumed off the shelf by bundling our few
  // 'dependencies'.
  externals: [nodeExternals({
    whitelist: ['autosuggest-highlight', 'prop-types', 'react-autosuggest'],
  })],
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
