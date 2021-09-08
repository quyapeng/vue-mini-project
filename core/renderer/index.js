// diff

// mountElement

export function mountElement(vnode, container) {
  // 把虚拟dom转换成一个真实的dom
  // tag
  const { tag, props, children } = vnode;
  const el = document.createElement(tag);
  // props 是个对象或者null
  if (props) {
    for (const key in props) {
      const val = props[key];
      el.setAttribute(key, val);
    }
  }
  // children
  // 1.可以接收一个string2.可以接收一个数组
  if (typeof children === "string" || typeof children === "number") {
    // string
    // 每次更新全量替换。
    const textNode = document.createTextNode(children);
    el.append(textNode);
  } else {
    // 递归
    children.forEach((v) => {
      mountElement(v, el);
    });
  }

  container.append(el);
}
