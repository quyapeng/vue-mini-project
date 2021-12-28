import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    //
    return h("div", {}, [h("p", {}, "current demo"), h(Foo)]);
  },

  setup() {
    const instance = getCurrentInstance();
    console.log("app:", instance);
  },
};
