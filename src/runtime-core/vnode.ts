//
export function createVNode(type, props?, children?) {
  // 创建一个虚拟节点
  const vnode = {
    type,
    props,
    children,
    el: null,
  };

  return vnode;
}
