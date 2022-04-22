export { h } from "./h";
export { renderSlots } from "./helpers/renderSlots";
export { createTextVNode, createElementVNode } from "./vnode";
export { getCurrentInstance, registerRuntimeCompiler } from "./component";
export { provide, inject } from "./apiInject";
export { createRenderer } from "./renderer";
export { nextTick } from "./scheduler";

export { toDisplayString } from "../shared";
// 遵循依赖顺序
export * from "../reactivity";
