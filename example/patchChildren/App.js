import { h } from "../../lib/guide-mini-vue.esm.js";

import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";
import ArrayToArray from "./ArrayToArray.js";
// 组件实现
export const App = {
  setup() {},
  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // 老的是array 新的是text
      // h(ArrayToText),
      // 老的是text 新的是text
      // h(TextToText),
      // 老的是text 新的是array
      h(TextToArray),
      // 老的是array 新的是array
      // h(ArrayToArray)
    ]);
  },
};
