import { createVNode, Fragment } from "../vnode";
export function renderSlots(slots, name, props) {
  // children -> vnode
  // 是否有slots name
  const slot = slots[name];

  if (slot) {
    // function
    if (typeof slot === "function") {
      // children不可以有数组==》fragment
      // 只需要吧children渲染出来就可以，不需要渲染此处根节点div
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
