import CountChange from "./es6";

const instance = new CountChange();
function test(content) {
  document.querySelector("#app").innerHTML = content;
}

// setInterval(() => {
  instance.increment();
  test(instance.count);
// }, 1000);
