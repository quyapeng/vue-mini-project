import { ShapeFlags } from "../shared/ShapeFlag";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export { createVNode as createElementVNode };
//

export function createVNode(type, props?, children?) {
  // 创建一个虚拟节点
  const vnode = {
    type,
    props,
    key: props?.key,
    children,
    shapeFlags: getShapeFlag(type),
    el: null,
    component: null,
  };

  if (typeof children === "string") {
    // children
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
    // vnode.shapeFlags = vnode.shapeFlags | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
  }

  // 组件+ children是object
  if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
