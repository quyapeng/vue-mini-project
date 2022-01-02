// 老的是text 新的是text

import { ref, h } from "../../lib/guide-mini-vue.esm.js";

const prevChildren = "oldChild";
const nextChildren = "newChild";

export default {
  name: "TextToText",
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
