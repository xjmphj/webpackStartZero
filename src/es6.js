const decorator = (target, key, descriptor) => {
  target[key] = function (...args) {
    console.log(this.count);

    return descriptor.value.applay(this, args);
  };
};

export default class CountChange {
  count = 1;
  // decoratorsBeforeExport: true
  @decorator
  increment() {
    this.count++;
  }
  decrese() {
    this.count--;
  }
}
