import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlag";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  // 调用patch方法
  patch(vnode, container);
}

function patch(vnode, container) {
  // fragment
  // fragment -->只渲染children
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }
  // shapeflags vnode->flag
  // elementflag

  // patch
  // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
  // vnode.type 是一个字符串就是element,如果是对象，就是component
  // console.log(vnode.type);

  // 结构出shapeflag ,看啥是element还是组件

  // if (typeof vnode.type === "string") {
  //   // element
  //   processElement(vnode, container);
  // } else if (isObject(vnode.type)) {
  //   // 组件
  //   processComponent(vnode, container);
  // }
  // 去处理组件
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
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
  // vnode 是element的
  const { type, props, children, shapeFlags } = vnode;
  const el = (vnode.el = document.createElement(type));

  // & 运算符判断是否为0的

  // text_children
  // if (typeof children === "string") {
  //   el.textContent = children;
  // } else if (Array.isArray(children)) {
  //   // 数组，
  //   // children.forEach((v) => {
  //   //   patch(v, el);
  //   // });
  //   // array_children
  //   mountChildren(vnode, el);
  // }
  // shape
  if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  for (const key in props) {
    const val = props[key];
    // console.log("key", key, val);
    // 以on开头，小驼峰的属性 如onClick
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChildren(vnode, el) {
  vnode.children?.forEach((v) => {
    patch(v, el);
  });
}

function processComponent(vnode, container) {
  // 挂载组件
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container: any) {
  // 通过虚拟节点，创建组件实例对象
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // vnode-> patch
  // vnode-> element -> mountElement
  patch(subTree, container);

  // 所有element处理完
  initialVNode.el = subTree.el;
}
