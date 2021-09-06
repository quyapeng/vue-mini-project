// // function update() {
// //   b = a + 10;
// // }
// // 当a发生变更了，b自动更新
// // const { effect, reactive } = require("@vue/reactivity");
// import { effectWatch, reactive } from "./core/reactivity/index.js";
// // ref,--> number,boolean,string
// // reactive 对象
// // 声明一个 响应式对象
// let a = reactive({
//   value: 1,
// });
// let b;
// effectWatch(() => {
//   // 执行一次
//   // 响应式对象的值改变后，a发生变化后，再执行一次。
//   b = a.value + 10;
//   console.log("b", b);
// });
// a.value = 30;
import { reactive } from "./core/reactivity/index.js";
import { h } from "./core/h.js";
export default {
  // template -> render
  render(context) {
    // 通用
    // effectWatch(() => {
    // view  每次都需要重新创建 虚拟dom
    // 优化点： 计算出最小的更新点，只更新某一处。--vdom
    // js--> diff算法

    // reset
    // document.body.innerText = "";
    // const div = document.createElement("div");
    // div.innerText = context.state.count;
    // //   document.body.append(div);
    // return div;

    //
    return h(
      "div",
      {
        id: "app-id",
        class: "showTime",
      },
      // context.state.count
      [h("p", null, context.state.count), h("p", null, "嘻嘻")]
    );
    // });
  },
  setup() {
    const state = reactive({
      count: 0,
    });
    window.state = state;
    return {
      state,
    };
  },
};
// App.render(App.setup());
