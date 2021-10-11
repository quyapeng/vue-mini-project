import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // 调用patch方法
  patch(vnode, container);
}

function patch(vnode, container) {
  // patch
  // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
  // vnode.type 是一个字符串就是element,如果是对象，就是component
  console.log(vnode.type);
  if (typeof vnode.type === "string") {
    // element
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 组件
    processComponent(vnode, container);
  }
  // 去处理组件
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
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  // vnode: type, props, children
  // const el = document.createElement('div');

  // el.textContent = 'hi,mini-vue~';
  // el.setAttribute('id', 'root');

  // document.body.append(el)
  const { type, props, children } = vnode;
  const el = document.createElement(type);
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 数组，
    // children.forEach((v) => {
    //   patch(v, el);
    // });
    mountChildren(children, el);
  }

  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountChildren(children, el) {
  children.forEach((v) => {
    patch(v, el);
  });
}