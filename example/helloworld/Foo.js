import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    // 接收传过来的props
    console.log("props", props);
    // props.count++;
    // console.log(props);
  },

  render() {
    return h("div", {}, "foo:" + this.count);
  },
};
