import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
// 组件实现
export const App = {
  // .vue 单文件组件是直接写template,当前用render函数
  render() {
    window.self = this;
    //
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mousedown");
        },
      },
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
      // "hi, " + this.msg
      // string
      // "hi, mini-vue"
      // Array
      // [h("p", { class:"red"}, "hi"), h("p", {class:"blue"}, "mini-vue")]
    );
  },

  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
