const fs = require("fs");
const path = require("path");
// 转换代码
const parse = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const template = require("@babel/template").default;
const t = require("@babel/types");

const pluginName = "AutoTryCatch";

class AutoTryCatch {
  constructor(options) {
    this.options = options || { dir: ["src"], pattern: [".js"] };
    // 匹配的文件格式
    this.pattern = this.options.pattern;
  }

  apply(compiler) {
    //在 compilation 完成时执行。
    compiler.hooks.done.tap(pluginName, (stats) => {
      //遍历src 文件下的子文件
      this.options.dir.forEach((item) => {
        const path1 = path.resolve(item);
        //同步读取文件路径
        fs.readdir(path1, (err, files) => {
          // 同步读取文件，node 经典的 err前置
          if (!err) {
            // 都当文件处理
            files.forEach((filename) => {
              const absPath = path.resolve(item, filename);
              const extname = path.extname(filename);
              // 这里做了一个约束条件，对于其他类型的文件，总是报错,只处理react2.js
              if (this.pattern.includes(extname) && absPath.indexOf('react2.js') > 0) {
                // 获取抽象语法树 是一个json
                const ast = this.getAst(absPath);
                // 递归处理抽象语法树
                this.handleTraverse(ast, absPath);
              }
            });
          }
        });
      });
    });
  }

  getAst(filename) {
    // 
    const content = fs.readFileSync(filename, 'utf-8');
    try {
      // 文件内容转换为抽象语法树，sourceType: 'module' 指示代码应该被解析的模式
      return parse(content, {
        sourceType: 'module',
        // 转换出错的时候，这里尝试处理
        // plugins: [
        //   "jsx",
        // ],
      })
    } catch (e) {
      return null;
    }
  }

  handleTraverse(ast, filePath) {
    let isChanged = false
    const shouldHandleAst = path => {
      // path 代表节点
      // 获取节点类型
      const types = path.node.body.body.map(({ type})=>type)
      // 只有函数长度为1 且包含一个try-catch 函数的 或者 函数定义的长度>=1 并且不包含try-catch 函数的 函数需要被改变
      isChanged = path.node.body.body.length > 1 && types.includes('TryStatement') || path.node.body.body.length && !types.includes('TryStatement')
      if (isChanged) {
        // 抽象语法树再转换回代码块包含try-catch 的
        this.handleAst(ast, filePath)
      }
    }
    // 递归转换ast,哪些定义的函数需要转换
    traverse(ast, {
      // 函数体定义的需要转换，后面是回调函数
      FunctionDeclaration: shouldHandleAst,
      // 函数表达式 ..
      FunctionExpression: shouldHandleAst,
      // 箭头函数 ...
      ArrowFunctionExpression: shouldHandleAst
    })
  }

  handleAst(ast, filePath) {
    const _this = this;
    traverse(ast, {
      BlockStatement(path) {
        // 不是trycatch 函数的进行转换
        if(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(path.parentPath.parentPath.type) && path.node.body[0].type !== 'TryStatement'){
          // 生成tryCatch 内容
          const tryStatement = _this.generateTryStatement(path.node);
          // 包装成块
          const blockStatement = t.blockStatement([tryStatement])
          path.replaceWith(blockStatement)
        }
      },
      Program: {
        exit(){
          _this.writeFileSync(ast, filePath)
        }
      }
    })
  }

  generateTryStatement({body = []}) {
    const nodeBody = t.blockStatement(body);
    // 生成抽象语法树
    return template.ast(`try 
      ${generator(nodeBody).code} 
      catch (err) {
        console.log(err);
      }`)
  }

  writeFileSync(ast, filePath) {
    // 格式化后的代码
    const output = generator(ast, {
      retainLines: false,
      quotes: 'single',
      concise: false,
      compact: false
    })

    fs.writeFileSync(filePath, output.code)
  }
}

module.exports = AutoTryCatch;
