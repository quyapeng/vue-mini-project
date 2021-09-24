import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export function reactive(raw) {
  // 处理ts config lib ["DOM","es6"]
  return createActiveObject(raw, mutableHandlers);
}

// readonly
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
