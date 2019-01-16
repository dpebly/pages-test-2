const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const LinkMediaHtmlWebpackPlugin = require('link-media-html-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const pathsToClean = [path.resolve('assets', 'js'), path.resolve('assets', 'css')]
const cleanConfig = {
   root: __dirname,
   allowExternal: true,
   exclude: ['three.min-v0.96.0.js', 'flexboxgrid.min-v6.3.1.css']
}


module.exports = {
  entry: {
        index: './_src/js/index.js',
        style: './_src/scss/style.scss'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      // '_icons': path.join(__dirname, 'src/icons'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-2']
        },
        exclude: /node_modules/
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: (loader) => [
                require('autoprefixer')({browsers: ['last 3 versions', '> 1%']}),
              ]
            }
          },
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(pathsToClean, cleanConfig),

    new FixStyleOnlyEntriesPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['index', 'style'],
      template: path.resolve('_src', '_template', 'default.html'),
      filename: path.resolve('_layouts', 'home.html')
    }),
    new LinkMediaHtmlWebpackPlugin(),
  ]
};
