const { getOptions } = require('loader-utils');
const { validate } = require('schema-utils');

const scheme = {
  type: 'object',
  properties: {
    width: {
      type: 'number'
    }
  }
}

// common js 的规范
module.exports = function loader(source){
  console.log("*************8---------")
  const options = getOptions(this)
  validate(scheme, options, {
    name: 'px2w Loader',
    baseDataPath: 'options'
  })
  const px2vw = px => px / options.width * 100 + 'vw';
  // 必须要return 一个内容
  return source.replace(/(\d+)px/g, (_, px) => px2vw(px));
}