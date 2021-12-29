import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlag";
import { Fragment, Text } from "./vnode";
import { createAPI } from "./createApp";

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options;

  function render(vnode, container) {
    // 调用patch方法
    patch(vnode, container, null);
  }

  function patch(vnode, container, parentComponent) {
    // fragment
    // fragment -->只渲染children
    const { type, shapeFlags } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;

      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    // vnode: type, props, children
    // const el = document.createElement('div');

    // el.textContent = 'hi,mini-vue~';
    // el.setAttribute('id', 'root');

    // document.body.append(el)
    // vnode 是element的
    const { type, props, children, shapeFlags } = vnode;

    //
    // 自定义渲染接口customRender
    // new Element() 不依赖平台，依赖接口
    // const el = (vnode.el = document.createElement(type));
    const el = (vnode.el = createElement(type));

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
      mountChildren(vnode, el, parentComponent);
    }

    for (const key in props) {
      const val = props[key];
      // console.log("key", key, val);
      // 以on开头，小驼峰的属性 如onClick
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   el.addEventListener(key.slice(2).toLowerCase(), val);
      // } else {
      //   el.setAttribute(key, val);
      // }

      patchProp(el, key, val);
    }
    // container.append(el);
    insert(el, container);
  }

  function mountChildren(vnode, el, parentComponent) {
    vnode.children?.forEach((v) => {
      patch(v, el, parentComponent);
    });
  }

  function processComponent(vnode, container, parentComponent) {
    // 挂载组件
    mountComponent(vnode, container, parentComponent);
  }

  function mountComponent(initialVNode: any, container: any, parentComponent) {
    // 通过虚拟节点，创建组件实例对象
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container: any) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode-> patch
    // vnode-> element -> mountElement
    patch(subTree, container, null);

    // 所有element处理完
    initialVNode.el = subTree.el;
  }

  return {
    createApp: createAPI(render),
  };
}
