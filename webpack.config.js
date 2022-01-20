const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  // 入口文件
  entry: "./src/react.js",
  output: {
    path: path.resolve(__dirname, "output"),
    // 默认叫main.js
    filename: "[name].js",
  },
  devServer: {
    port: 8000,
    // 开启热更新
    hot: true
  },
  // externals:{
  //   'react': 'React', // import React from 'react'; => const react = window.react => <script src="react.cdn"></script>
  //   'react-dom': 'React-dom'
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            // plugins: ["@babel/plugin-transform-runtime"],
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [ 
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            // options: {
            //   modules: true
            // },
        }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          filename: "vendor.js",
          chunks: "all",
          // test:  /[\\/]node_modules[\\/](react|react-dom)[\\/]/
          test:  /[\\/]node_modules[\\/]/
        },
      },
    },
  },
};
