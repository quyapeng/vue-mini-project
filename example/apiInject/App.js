import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";
// parent
const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(Child)]);
  },
};
// 2级中间层
const Child = {
  name: "Child",
  setup() {
    provide("foo", "Child");
    const foo = inject("foo");
    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [h("p", {}, `Child foo:${this.foo}`), h(Consumer)]);
  },
};
// 底层
const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // const baz = inject("baz", "default");
    const baz = inject("baz", () => "default");
    return {
      foo,
      bar,
      baz,
    };
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
  },
};
