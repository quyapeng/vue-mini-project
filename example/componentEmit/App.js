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
        onAdd() {
          console.log("onAdd");
        },
      }),
    ]);
  },

  setup() {
    return {};
  },
};
