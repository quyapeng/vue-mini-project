// 组件实现
export const App = {
  // .vue 单文件组件是直接写template,当前用render函数
  render() {
    return h("div", "hi, " + this.msg);
  },

  setup() {
    // composition api

    return {
      msg: "mini-vue",
    };
  },
};
