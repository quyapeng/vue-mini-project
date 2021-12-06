import { ShapeFlags } from "../shared/test";

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
    //
    vnode.shapeFlags = vnode.shapeFlags | ShapeFlags.TEXT_CHILDREN;
  }
  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
