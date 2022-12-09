let activeEffect;
// 抽离概念
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    console.log("activeEffect", this);
    this._fn();
  }
}

export function effect(fn) {
  // fn
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}
const targetMap = new Map();
export function track(target, key) {
  // target -> key -> dep
  // const dep = new Set();
  let depsMap = targetMap.get(target); // target

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key); // key
  if (!dep) {
    dep = new Set();
    targetMap.set(target, dep);
  }

  dep.add(activeEffect);
  console.log("track", target, key);
  console.log("depsMap", depsMap);
  console.log("dep", dep);
}
