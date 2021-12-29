import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}
function patchProp(el, key, val) {
  //  以on开头，小驼峰的属性 如onClick
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), val);
  } else {
    el.setAttribute(key, val);
  }
}
function insert(el, container) {
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...agrs) {
  return renderer.createApp(...agrs);
}

export * from "../runtime-core";
