import { createVNode } from "../vnode";

export function renderSlots(slots, name, props) {
  // children -> vnode
  // 是否有slots name
  const slot = slots[name];

  if (slot) {
    // function
    if (typeof slot === "function") {
      return createVNode("div", {}, slot(props));
    }
  }
}
