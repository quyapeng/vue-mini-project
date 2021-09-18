import { track, trigger } from "./effect";

export function reactive(raw) {
  // 处理ts config lib ["DOM","es6"]
  return new Proxy(raw, {
    get(target, key) {
      // get
      const res = Reflect.get(target, key);
      track(target, key);
      return res;
    },

    set(target, key, value) {
      // set
      const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
    },
  });
}
