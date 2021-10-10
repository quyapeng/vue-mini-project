import { createVNode } from "./vnode";
import { render } from "./renderer";

//
export function createApp(rootComponent) {
  // 接收一个根组件

  return {
    mount(rootContainer) {
      // 根容器 也就是#app
      // 先把所有东西转为vnode
      // component -> vnode
      // 所有逻辑操作基于 vnode 来处理
      const vnode = createVNode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}
