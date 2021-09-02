// function update() {
//   b = a + 10;
// }
// 当a发生变更了，b自动更新
const { effect, reactive } = require("@vue/reactivity");
// ref,--> number,bealoon,string
// reactive 对象
// 声明一个 响应式对象
let a = reactive({
  value: 1,
});
let b;
effect(() => {
  // 执行一次
  // 响应式对象的值改变后，a发生变化后，再执行一次。
  b = a.value + 10;
  console.log("b", b);
});
a.value = 30;
