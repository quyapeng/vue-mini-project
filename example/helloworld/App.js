import { h } from "../../lib/guide-mini-vue.esm.js";

// 组件实现
export const App = {
  // .vue 单文件组件是直接写template,当前用render函数
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard "],
      },
      // setupState
      // this.$el
      "hi, " + this.msg
      // [h("p", { class: "red" }, "hi"), h("a", { class: "blue" }, "blue")]
    );
  },

  setup() {
    // composition api

    return {
      msg: "mini-vue",
    };
  },
};
