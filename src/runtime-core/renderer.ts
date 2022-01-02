import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlag";
import { Fragment, Text } from "./vnode";
import { createAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(n2: any, container) {
    // 调用patch方法
    patch(null, n2, container, null);
  }
  // n1  老的
  // n2  新的
  function patch(n1, n2, container, parentComponent) {
    // fragment
    // fragment -->只渲染children
    const { type, shapeFlags } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1: any, n2: any, container: any, parentComponent) {
    mountChildren(n1, n2, container, parentComponent);
  }

  function processElement(n1: any, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n1, n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }
  function patchElement(n1, n2, container) {
    console.log("patchElement", n1, n2, container);
    // props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el);
    patchProps(el, oldProps, newProps);
    // children
  }
  function patchChildren(n1, n2, container) {
    //
    const { shapeFlags: prevShapeFlag } = n1;
    const { shapeFlags: nextShapeFlag } = n2;

    const c1 = n1.children;
    const c2 = n2.children;
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 把老的children清空
        // 2. 设置text
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    }
  }
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      // remove
      hostRemove(el);
    }
  }
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 属性变更
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== {}) {
        // 属性删除
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function mountElement(n1: any, n2: any, container: any, parentComponent) {
    // vnode: type, props, children
    // const el = document.createElement('div');

    // el.textContent = 'hi,mini-vue~';
    // el.setAttribute('id', 'root');

    // document.body.append(el)
    // vnode 是element的
    const { type, props, children, shapeFlags } = n2;

    //
    // 自定义渲染接口customRender
    // new Element() 不依赖平台，依赖接口
    // const el = (vnode.el = document.createElement(type));
    const el = (n2.el = hostCreateElement(type));

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
      mountChildren(n1, n2, el, parentComponent);
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

      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(n1, n2, el, parentComponent) {
    n2.children?.forEach((v) => {
      patch(null, v, el, parentComponent);
    });
  }

  function processComponent(n1, n2, container, parentComponent) {
    // 挂载组件
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode: any, container: any, parentComponent) {
    // 通过虚拟节点，创建组件实例对象
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container: any) {
    console;
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));

        patch(null, subTree, container, instance);

        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAPI(render),
  };
}
