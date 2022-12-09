import { track } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      // {foo: 1}
      // 收集依赖
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // 触发依赖
      return Reflect.set(target, key, value);
    },
  });
}
