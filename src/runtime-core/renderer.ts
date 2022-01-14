import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlag";
import { Fragment, Text } from "./vnode";
import { createAPI } from "./createApp";
import { effect } from "../reactivity/effect";
import { shouldUpdateComponent } from "./componentUpdateUtils";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode: any, container) {
    // 调用patch方法
    // render的时候不需要anchor
    patch(null, vnode, container, null, null);
  }
  // n1  老的
  // n2  新的
  function patch(n1, n2, container, parentComponent, anchor) {
    // fragment
    // fragment -->只渲染children
    const { type, shapeFlags } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement", n1, n2, container);
    // props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
    // children
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    //
    const { shapeFlags: prevShapeFlag } = n1;
    const { shapeFlags: nextShapeFlag } = n2;

    const c1 = n1.children;
    const c2 = n2.children;
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // new text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array
        // 1. 把老的children清空
        // 2. 设置text
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // new array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        //array diff arry
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    // c1老的数组, c2新的的数组
    // 索引
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    //  右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // console.log(i);
    // 3. 新的比老的多 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 乱序 中间对比
      let s1 = i; // 老节点
      let s2 = i;

      let patched = 0;
      const toBePatched = e2 - s2 + 1;

      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched);

      let moved = false;
      let maxNewIndexSoFar = 0;
      //
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (let i = s2; i <= e2; i++) {
        let nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      // console.log("keyToNewIndexMap", keyToNewIndexMap);

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key !== null) {
          //
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              //跳出当前循环
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 已存在 避免i为0时出错，此处需要+1
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const insreasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // console.log("insreasingNewIndexSequence", insreasingNewIndexSequence);
      let j = insreasingNewIndexSequence.length - 1;

      //
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          // 创建新的
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== insreasingNewIndexSequence[j]) {
            console.log("移动位置", insreasingNewIndexSequence[j]);
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }
  // 是相同的vnode
  function isSameVNodeType(n1, n2) {
    // 1,type
    // 2.key
    return n1.type === n2.type && n1.key === n2.key;
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
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
    const el = (vnode.el = hostCreateElement(type));

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
      mountChildren(children, el, parentComponent, anchor);
    }

    for (const key in props) {
      // console.log("key", key, val);
      // 以on开头，小驼峰的属性 如onClick
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   el.addEventListener(key.slice(2).toLowerCase(), val);
      // } else {
      //   el.setAttribute(key, val);
      // }
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children?.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2: any, container, parentComponent, anchor) {
    // 挂载组件
    if (!n1) {
      // n1没有的时候才是mount
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      // 有值的时候是更新
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      // component最新
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      n2.vnode = n2;
    }
  }

  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    // 通过虚拟节点，创建组件实例对象
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(
    instance: any,
    initialVNode,
    container: any,
    anchor
  ) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));

        patch(null, subTree, container, instance, anchor);

        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        // 更新当前组件实例上的属性 props
        // 需要一个更新之后的虚拟节点
        const { next, vnode } = instance;
        if (next) {
          //
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }
        //
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAPI(render),
  };
}
function updateComponentPreRender(instance, nextVNode) {
  // 重新设置vnode,并清空
  instance.vnode = nextVNode;

  instance.next = null;
  instance.props = nextVNode.props;
}
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
