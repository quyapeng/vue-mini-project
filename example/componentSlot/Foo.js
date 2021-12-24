import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup() {
    return {};
  },

  render() {
    const foo = h("p", {}, "slot foo:");
    // children
    // renderSlots
    // 具名插槽
    // 1. 获取到要渲染的元素
    // 2. 要获取到渲染的位置
    return h("div", {}, [
      renderSlots(this.$slots, "header", {
        age: 18,
      }),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
