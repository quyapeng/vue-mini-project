import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

// 枚举
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__V_isReadonly",
}

export function reactive(raw) {
  // 处理ts config lib ["DOM","es6"]
  return createActiveObject(raw, mutableHandlers);
}

// readonly
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

// isReactive
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
  // return value['is_reactive']
}

// isReactive
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
