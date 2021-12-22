import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";
import { isObject } from "../shared/index";
// 枚举
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__V_isReadonly",
}

export function reactive(raw) {
  // 处理ts config lib ["DOM","es6"]
  return createReactiveObject(raw, mutableHandlers);
}

// readonly
export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

// isReactive
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
  // return value['is_reactive']
}

// isReadonly
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

// isProxy
export function isProxy(value) {
  // value
  return isReactive(value) || isReadonly(value);
}

function createReactiveObject(target: any, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`target ${target}必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandlers);
}

// shallowReadonly
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}
