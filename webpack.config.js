const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const TemplatedPathPlugin = require("./my-plugin");

// const AutoTryCatch = require("./try-catch-plugin");
// const FileListPlugin = require('./file-list-plugin');
module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  // 入口文件
  entry: "./src/react2.js",
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
      // { 
      //   test: /\.html?$/, 
      //   use:{
      //     loader: require.resolve('html-loader'),
      //     options:{
      //     }
      //   }
      // },
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
        exclude:[
          path.resolve(__dirname, "./src/style.mobile.css")
        ]
      },
      {
        test: /\.mobile\.css$/,
        use: [MiniCssExtractPlugin.loader, {
          loader: 'css-loader',
          /* options: {
            modules: true
          } */
        }, {
          loader: './mobile-css-loader',
          options: {
            width: 750,
          }
        }]
      }
    ]
  },
  plugins: [
    // new TemplatedPathPlugin(),
    // new FileListPlugin({
    //   filename:'list.md'
    // }),
    new AutoTryCatch(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      filename:'index.html', //配置输出文件名和路径
      template: './index.html' //配置文件模板
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
  stats: {
    children: true,
  },
};
