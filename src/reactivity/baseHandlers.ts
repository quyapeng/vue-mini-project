import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { isObject } from "../shared/index";

// 定义出来只调用一次，然后存储在变量get中，后续不需要每次都去调用，缓存机制，
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

// 利用高阶函数
// 抽离出get函数，两个区别为track是否需要调用，也就是是否需要收集依赖？
function createGetter(isReadonly = false) {
  //  默认值为false
  // 是否是只读
  return function get(target, key) {
    //
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) track(target, key);
    return res;
  };
}
// 保持代码一致性，set也可以抽离

function createSetter() {
  //  默认值为false
  // 是否是只读
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    // 警告
    console.warn(
      `key:${key} set 失败，因为 target:${target} 是readonly`,
      key,
      target
    );
    return true;
  },
};
