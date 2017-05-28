const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve(__dirname, '..');

module.exports = {
  entry: path.join(root, 'playground/index.js'),
  output: {
    path: path.join(root, 'dist'),
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }]
    }, {
      test: /\.png$/,
      use: 'file-loader'
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'Element Anchor Playground',
      template: 'playground/index.ejs'
    }),
    new webpack.NamedModulesPlugin()
  ],
  devServer: {
    host: 'localhost',
    port: 9000,
    hot: true,
    historyApiFallback: true
  },
  devtool: 'source-map'
};
