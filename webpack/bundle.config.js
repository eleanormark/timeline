const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve(__dirname, '..');

module.exports = {
  entry: {
    'timeline': ['babel-polyfill', path.join(root, 'playground/index.js')]
  },
  output: {
    path: path.join(root, 'dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map'
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
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new HtmlWebpackPlugin({
      title: 'Buzzalt Timeline Playground',
      template: 'playground/index.ejs'
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    new webpack.BannerPlugin({
      banner: fs.readFileSync(path.join(root, 'playground/BUNDLE_LICENSE'), 'utf8'),
      raw: true
    })
  ]
};
