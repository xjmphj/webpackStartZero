import React from "react";
import { render } from "react-dom";
import style from "./style.css";

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


render(<App />, document.querySelector("#app"));

// 如果组件有更新，会重新执行下面的回调
if (module.hot) {
  module.hot.accept(App, () => {
    render(<App />, document.querySelector("#app"));
  });
}
