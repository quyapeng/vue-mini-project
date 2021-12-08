import { ShapeFlags } from "../shared/ShapeFlag";

//
export function createVNode(type, props?, children?) {
  // 创建一个虚拟节点
  const vnode = {
    type,
    props,
    children,
    shapeFlags: getShapeFlag(type),
    el: null,
  };
  if (typeof children === "string") {
    // children
    vnode.shapeFlags = vnode.shapeFlags | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlags = ShapeFlags.ARRAY_CHILDREN;
  }
  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
