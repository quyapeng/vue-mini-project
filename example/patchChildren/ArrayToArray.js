// 老的是array 新的是text

import { ref, h } from "../../lib/guide-mini-vue.esm.js";

const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];
const nextChildren = [h("p", {}, "1"), h("p", {}, "2")];

export default {
  name: "ArrayToArray",
  setup() {
    const isChange = (window.isChange = ref(false));

    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return h("div", {}, self.isChange ? nextChildren : prevChildren);
  },
};
