const replacePathVariables = (path, options) => {
  path = path + '111'
  return path;
};



const plugin = "TemplatedPathPlugin";
class TemplatedPathPlugin {
  apply(compiler) {
    // 回调参数根据 compiler.hooks.<hook name> hook name 文档上的数据来查看
    // compiler.hooks.run.tap(plugin, compiler => {
    //   console.log(compiler)
    // });
    compiler.hooks.compilation.tap(plugin, compilation => {
      compilation.hooks.assetPath.tap(plugin, replacePathVariables)
    })
  }
}

module.exports = TemplatedPathPlugin