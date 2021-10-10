import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // 调用patch方法
  patch(vnode, container);
}

function patch(vnode, container) {
  // patch

  // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
  // vnode.type 是一个字符串就是element,如果是对象，就是component
  // 去处理组件
  processComponent(vnode, container);
}

function processComponent(vnode, container) {
  // 挂载组件
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container: any) {
  // 通过虚拟节点，创建组件实例对象
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();

  // vnode-> patch

  // vnode-> element -> mountElement
  patch(subTree, container);
}
