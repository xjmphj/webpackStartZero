
## 从零开始做一个webpack 配置
#### npm init 初始化一个项目
```js
npm init 

yarn add webpack webpack-cli -D
```

环境准备

```js
"webpack": "^5.66.0",
"webpack-cli": "^4.9.1"
```

#### 创建一个初始化的页面文件 src

src
  index.js
  index.html

package.json 创建一个执行命令
```js
...
"scripts": {
    "build": "webpack ./src/index.js -o ./output --mode=development --devtool=cheap-module-source-map"
  }
  ...
```

执行 `yarn build` 发现生成了output 文件夹，及main.js 和main.js.map

打包出来的默认是一个立即执行函数（闭包）, 没有涉及到不同的包umd 等
```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
function test (content) {
  document.querySelector('#app').innerHTML = content
}

test('something')
/******/ })()
;
//# sourceMappingURL=main.js.map
```

 html 页面中引入打包好的文件
 ```js
 <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <div id="app"></div>
    </body>
    <script src="./output/main.js"></script>
  </html>
 ```
这就是最从0-1的基础的打包, h5 中如果需要一个脚手架转义es6 等 可以这么使用。

## webpack 从一到二
1、新建 webpack.config.js ，将build 命令放入配置文件中

```js
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  // 入口文件
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'output'),
    // 默认叫main.js
    filename: 'main.js'
  }
}

```

package.json 修改命令

```js
...
"scripts": {
    "build": "webpack"
  }
  ...
```
执行 `yarn build` 得到同样的结果

#### es6.js 配置
创建一个src/es6.js文件
```js
export default class CountChange {
  count = 1
  increment = ()=>{
    this.count++
  }
  decrese = ()=> {
    this.count--
  }
}

```
在 src/index.js 文件中引入es6.js 文件
```js
import CountChange from "./es6"

const instance = new CountChange()
function test (content) {
  document.querySelector('#app').innerHTML = content
}

test(instance.count)
```
再次打包 `yarn build` 执行发现可以，虽然我们没有配置es6模块的loader ,但是已经可以支持 `import` 和 `export`，低版本的webpack 可能有问题，还是需要配置。

可见 class CountChange 还是老样子，虽然 chrome 已经支持了类的原生运行，但是有些浏览器还是只能使用ES5的代码。再如果我们使用装饰器的话，chrome 也无能为力。

这是打包的产物图片
![image](/md-images/1.PNG)

#### babel 出场

 安装
 ```js
 yarn add @babel/core @babel/preset-env babel-loader -D
 ```
 `@babel/core` 是核心，`@babel/preset-env` 是基于环境的预设 ，`babel-loader` 是webpack 处理babel需要的。

  增加配置
  ```js
 {
    ...
    module:{
      rules:[
        {
          test: /\.js|jsx$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env']
              ]
            }
          }
        }
      ]
    }
    ...
  }
  ```

  删掉之前的output 文件，否则不是最新的打包文件，打包 `yarn build` 得到新的产物代码

  ![image](/md-images/2.png)
   
   加上装饰器
   `target` 是类，对其方法进行增强 `target[key]` 就是它的方法 比如 `increment` 方法

  es6.js 改写
   ```js
   
  const decorator = (target, key, descriptor) =>{
    target[key] = function (...args) {
      console.log(this.count)

      return descriptor.value.applay(this, args)
    }
  }

  export default class CountChange {
    count = 1

    @decorator
    increment = () => {
      this.count++
    }
    decrese = ()=> {
      this.count--
    }
  }

   ```

   执行 `yarn build` 发现报错
   ```js
    Support for the experimental syntax 'decorators-legacy' isn't currently enabled (13:3):

  11 |   count = 1
  12 |
> 13 |   @decorator
     |   ^
  14 |   increment = () => {
  15 |     this.count++
  16 |   }
   ```
   需要安装 装饰器 
   ```js
   yarn add @babel/plugin-proposal-decorators -D
   ```

   修改 package.json 配置
   ```js
   ...
    "babel": {
      "plugins": [
          ["@babel/plugin-proposal-decorators", { "legacy": true }]
      ]
    }
    ...

   ```
   重新 `yarn build` 重新打包，得到产物 main.js
  ![image](/md-images/3.png)


## 可用于生产环境的react 脚手架
安装 react 需要的包
```js
yarn add react react-dom -S
yarn add @babel/preset-react -D
```
创建文件src/react.js

```js
import React from "react";
import { render } from "react-dom";

const App = () => <div>App</div>

render(<App/>, document.querySelector('#app'));
```

webpack.config.js 修改babel-loader的 presets 模块

```js
module: {
    rules:[
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
          }
        }
      },
      
    ]
  },

```

 缓存包提取
webpack.config.js 修改 optimization
 ```js
  optimization:{
    // 拆分块
    splitChunks:{
      cacheGroups:{
        vendor:{
          filename: 'vendor.js',
          chunks: 'all', // async, initial 
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/
        }
      }
    }
  }

```
执行 `yarn build` 执行生成 main.js （7000多行-变到1300行左右）/ vendor.js。把 react 和 react-dom 打包到了 vendor.js 了

这次需要在index.html 中 修改引入 vendor.js
```js
<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <div id="app"></div>
    </body>
    <script src="./output/vendor.js"></script>
<script src="./output/main.js"></script>
  </html>
```
也可以使用 externals 加载cdn 文件
1.在HTML中引入第三方库的cdn
2.在webpack中配置externals
```js
  externals: {
      react: "React",
  }

```

加载css 文件

css loader

```js
yarn add style-loader css-loader -D
```

样式抽离
```js
yarn add mini-css-extract-plugin -D
```

修改webpack.config.js

```js
module: {
    rules: [
      ...
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ],
      },
      ...
    ],
  },
```

最终显示页面中 有一个插入的 style 显示样式

再导入一个 抽离样式的配置, 不然太多的样式插入到页面容易污染全局样式

修改webpack.config.js

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module: {
    rules: [
      ...
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            // options: {
            //   // 会自动生成模块id，样式不会重复,这里暂时不用，否则动态css 选择器和页面上的对应不上
            //   modules: true
            // },
          }
        ],
      },
      ...
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
```
后面又需要手动引入 output/main.css
```js
<link rel="stylesheet" type="text/css" href="./output/main.css" />
```

总是手动引入改动文件，是非常繁琐的，需要引入一个插件 htmlPluginWebpack

```js
yarn add html-webpack-plugin -D
```

webpack.config.js
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  ...
  plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      new HtmlWebpackPlugin({
        template: './index.html'
      })
    ]
  }
  ...

```

HMR 热更新
 到目前为止，我们一直在使用打包+刷新的模式查看代码的效果，显得十分繁琐低效。借助本地开发服务器来解决这个问题

 ```js
 yarn add webpack-dev-server -D
 ```

增加命令
 ```js
 "scripts": {
    "build": "webpack",
    "start": "webpack serve"
  },
 ```
启动 本地服务器 `yarn start` ,开启了本地服务 http://localhost:8080/

![image](/md-images/4.PNG)

发现 每次修改内容的时候是页面刷新形式的更新，不是热更新，此时不需要output 文件了，webpack-dev-server 把文件写入了内存，内存中的文件进行引用刷新。

```JS
devServer: {
  port: 8000,
  // 开启热更新
  hot: true
}
```
只配置 `hot: true` 的时候，会发现依然更新的时候是整个页面刷新更新的，需要把下面的回调方法也写上


```js
// src/react.js
// 如果组件有更新，会重新执行下面的回调
if (module.hot) {
  module.hot.accept(App, () => {
    render(<App />, document.querySelector("#app"));
  });
}
```

热更新取消掉 可以地址栏输入 `http://localhost:8000/?webpack-dev-servers-hot=false`


### 异步组件

引入异步组件 lazy()

```js
// react.js 中
  // 懒加载 高阶组件
  const lazy = (fn) =>
    class extends React.Component {
      state = {
        Component: () => null,
      };

      async componentDidMount() {
        const { default: Component } = await fn();
        this.setState({ Component });
      }

      render() {
        const Component = this.state.Component;
        return <Comment {...this.props}></Comment>;
      }
    };

    // polyfill 类似打补丁
  // if (typeof Proxy == undefined) {
  //   window.Proxy = xxx
  // }
  // babel 6, polyfill, promise, symbol, Set,Map 需要polyfill
  const Async = lazy(() => import(/* webpackName: 'Async'*/ "./Async"));

  const App = () => (
    <div>
      App <Async></Async>
    </div>
  );
```

```js
 // Async.js
  export default async function Async() {
    
    return (
      <div>
        Async
      </div>
    )
  }
```


报错 `regeneratorRuntime is not defined`
原因： 新的js 语法，如箭头函数等，而不转换API，比如 ilterator\ gennerator\ Set \Map \ proxy \ Reflect \ symbol \ Promise等全局对象，此时需要一些辅助函数（ babel 6 以下版本用polyfill 来打补丁，需要再entry之前或者根文件头部引入， 本例子均以babel 7之后的标准实现）

安装

```js
npm install --save-dev @babel/plugin-transform-runtime
```

```js
// .package.json

"babel": {
    "plugins": [
      "@babel/plugin-transform-runtime",
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ]
    ]
  },
```

`yarn build` 出现打包的文件 `Async.js`
后面页面报错 `exports is not defined` 没找打原因，大概是Async 组件的问题，不引用就可以


异步组件本质上解决的还是SPA 用户体验的问题，为webpack 提供了代码分割的依据，使得使用率高或者加载时间长的组件代码独立出去，同时通过低成本的过度交互，保证了网站的体验

`require.ensure`
```js
  require.ensure(
    dependencies: String[], // 依赖项
    callback: function(require), // 加载组件
    errorCallback: function(error), // 加载失败
    chunkName: String // 指定产出块名称
  )
```

```js
// src/react.js
const onClick = () =>{
  // 异步加载模块
  const fn = require.ensure([],function(){
    const ensure = require('./requireEnsure').default;
  })
}

const App = () => (
  <div onClick= { onclick }>
    App 
  </div>
);
```

```js
// src/requireEnsure.js
export default function () {
  alert('1')
}
```

`yarn build` 导出了一个 requireEnsure.js
 

### 后续关注
vue 已经开发了vite 不需要再用webpack 整一套了

dllPlugin 动态链接库，提前把依赖打包好，预打包

optimization.splitChunks.cacheGroups 优化

happyPack 多线程打包

vite 减少打包内容




























