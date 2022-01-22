import CountChange from "./es6"; // 引入 umd 的包，为什么通过es6 加载
// import webpackNumbers from '../../library/output/main'

const webpackNumbers = require("webpacknumbers");

const instance = new CountChange();

function test(content) {
  console.log(webpackNumbers, '特殊66');
  webpackNumbers.test();
  document.querySelector("#app").innerHTML = content;
} // setInterval(() => {


instance.increment();
test(instance.count); // }, 1000);