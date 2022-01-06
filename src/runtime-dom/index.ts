import { createRenderer } from "../runtime-core";

function createElement(type) {
  console.log("createElement");
  return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
  console.log("patchProp");
  //  以on开头，小驼峰的属性 如onClick
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
function insert(child, parent, anchor) {
  // parent.append(child);
  parent.insertBefore(child, anchor || null);
}

function remove(child) {
  //
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...agrs) {
  return renderer.createApp(...agrs);
}

export * from "../runtime-core";
