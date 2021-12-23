import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

// 组件实现
export const App = {
  name: "App",
  render() {
    // emit
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        onAdd(a, b) {
          console.log("onAdd", a, b);
        },
        onAddFoo(a, b) {
          console.log("onAddFoo", a, b);
        },
      }),
    ]);
  },

  setup() {
    return {};
  },
};
