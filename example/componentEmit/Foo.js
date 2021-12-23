import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    console.log("emit");
    const emitAdd = (p) => {
      console.log("emitAdd");
      emit("add", 1, 2);
      emit("add-foo", 1, 2);
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
