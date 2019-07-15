const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = merge(common, {
   devtool: 'inline-source-map',
   mode: 'development',
   devServer: {
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    }),
    new Dotenv({
      path: path.resolve(process.cwd(), "config/development.env")
    })
  ]
})
