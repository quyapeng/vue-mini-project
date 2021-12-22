import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    console.log("emit");
    const emitAdd = () => {
      console.log("emitAdd");
      emit("add");
    };

    return {
      emitAdd,
    };
  },

  render() {
    const foo = h("p", {}, "foo:");
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );

    return h("div", {}, [foo, btn]);
  },
};
