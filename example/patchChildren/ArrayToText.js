// 老的是array 新的是text

import { ref, h } from "../../lib/guide-mini-vue.esm.js";

const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];
const nextChildren = "newChildren";

export default {
  name: "ArrayToText",
  setup() {
    const isChange = (window.isChange = ref(false));
    //  = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return h("div", {}, self.isChange ? nextChildren : prevChildren);
  },
};
